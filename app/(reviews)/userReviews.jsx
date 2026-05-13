import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { useUser } from "../../src/context/UserContext";
import api from "../../src/services/api";

// opinion: 0 = Positive, 1 = Negative
function OpinionBadge({ opinion }) {
    const isPositive = opinion === 0;
    return (
        <View
            className={`flex-row items-center px-2 py-0.5 rounded-full border ${
                isPositive
                    ? "bg-green-500/20 border-green-500"
                    : "bg-red-500/20 border-red-500"
            }`}
        >
            <Ionicons
                name={isPositive ? "thumbs-up-outline" : "thumbs-down-outline"}
                size={12}
                color={isPositive ? "#22c55e" : "#ef4444"}
            />
            <Text
                className={`text-[11px] font-bold ml-1 ${
                    isPositive ? "text-green-400" : "text-red-400"
                }`}
            >
                {isPositive ? "Positive" : "Negative"}
            </Text>
        </View>
    );
}

function ReviewCard({ review, currentUserId, targetUserId, onDelete, onEdit }) {
    const isOwnReview = review.reviewingUserId === currentUserId;

    return (
        <View className="mx-4 mb-3 bg-zinc-900 border border-white rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                    <View className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 items-center justify-center mr-2">
                        <Ionicons name="person-outline" size={16} color="#ef4444" />
                    </View>
                    <Text className="text-white text-[14px] font-bold flex-1" numberOfLines={1}>
                        {review.reviewingUsername ?? `User #${review.reviewingUserId}`}
                    </Text>
                </View>
                <OpinionBadge opinion={review.opinion} />
            </View>

            <Text className="text-slate-300 text-[13px] leading-5 mb-3">
                {review.comment}
            </Text>

            {isOwnReview && (
                <View className="flex-row gap-2 border-t border-white pt-3">
                    <TouchableOpacity
                        onPress={() => onEdit(review)}
                        className="flex-1 flex-row items-center justify-center bg-black border border-white rounded-lg py-2"
                        activeOpacity={0.8}
                    >
                        <Ionicons name="pencil-outline" size={14} color="#ffffff" />
                        <Text className="text-white text-[12px] font-semibold ml-1">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onDelete(review)}
                        className="flex-1 flex-row items-center justify-center bg-red-500/20 border border-red-500 rounded-lg py-2"
                        activeOpacity={0.8}
                    >
                        <Ionicons name="trash-outline" size={14} color="#ef4444" />
                        <Text className="text-red-400 text-[12px] font-semibold ml-1">Delete</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

export default function UserReviews() {
    const { user } = useUser();
    // targetUserId = the user being reviewed (passed via router params)
    const { targetUserId, targetUsername } = useLocalSearchParams();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const parsedTargetId = parseInt(targetUserId);
    const isViewingOwnProfile = user?.id === parsedTargetId;

    const hasAlreadyReviewed = reviews.some(
        (r) => r.reviewingUserId === user?.id
    );

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get("/api/v1/getReviewsForUser", {
                params: { userId: parsedTargetId },
            });
            setReviews(response.data);
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
            setError("Could not load reviews. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [parsedTargetId]);

    useFocusEffect(
        useCallback(() => {
            if (parsedTargetId) fetchReviews();
        }, [parsedTargetId, fetchReviews])
    );

    function handleDelete(review) {
        Alert.alert(
            "Delete Review",
            "Are you sure you want to delete your review?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete("/api/v1/removeReview", {
                                params: {
                                    reviewedUserId: parsedTargetId,
                                    reviewingUserId: user?.id,
                                },
                            });
                            ToastAndroid.show("Review deleted.", ToastAndroid.SHORT);
                            fetchReviews();
                        } catch (err) {
                            console.error("Delete error:", err);
                            ToastAndroid.show("Failed to delete review.", ToastAndroid.SHORT);
                        }
                    },
                },
            ]
        );
    }

    function handleEdit(review) {
        router.push({
            pathname: "/(reviews)/editReview",
            params: {
                reviewedUserId: parsedTargetId,
                reviewingUserId: user?.id,
                currentComment: review.comment,
                currentOpinion: review.opinion,
            },
        });
    }

    const positiveCount = reviews.filter((r) => r.opinion === 0).length;
    const negativeCount = reviews.filter((r) => r.opinion === 1).length;

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar style="light" />

            <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-3"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-red-500 text-[13px] font-bold uppercase">
                        Reviews
                    </Text>
                    <Text className="text-white text-[22px] font-extrabold" numberOfLines={1}>
                        {targetUsername ?? "User"}
                    </Text>
                </View>

                {!isViewingOwnProfile && !hasAlreadyReviewed && !loading && (
                    <TouchableOpacity
                        onPress={() =>
                            router.push({
                                pathname: "/(reviews)/addReview",
                                params: {
                                    reviewedUserId: parsedTargetId,
                                    reviewedUsername: targetUsername,
                                },
                            })
                        }
                        className="ml-3 bg-red-500 border border-white rounded-lg px-3 py-2 flex-row items-center"
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={16} color="#fff" />
                        <Text className="text-white text-[13px] font-bold ml-1">Review</Text>
                    </TouchableOpacity>
                )}
            </View>

            {!loading && reviews.length > 0 && (
                <View className="mx-4 mt-4 mb-2 flex-row border border-white rounded-xl overflow-hidden bg-zinc-900">
                    <View className="flex-1 items-center py-3 border-r border-white">
                        <Text className="text-green-400 text-[20px] font-extrabold">{positiveCount}</Text>
                        <Text className="text-slate-400 text-[11px] mt-0.5">Positive</Text>
                    </View>
                    <View className="flex-1 items-center py-3 border-r border-white">
                        <Text className="text-white text-[20px] font-extrabold">{reviews.length}</Text>
                        <Text className="text-slate-400 text-[11px] mt-0.5">Total</Text>
                    </View>
                    <View className="flex-1 items-center py-3">
                        <Text className="text-red-400 text-[20px] font-extrabold">{negativeCount}</Text>
                        <Text className="text-slate-400 text-[11px] mt-0.5">Negative</Text>
                    </View>
                </View>
            )}

            {loading && (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#ef4444" size="large" />
                </View>
            )}

            {error && !loading && (
                <View className="mx-4 mt-3 p-3 bg-red-500/20 border border-red-500 rounded-xl flex-row items-center">
                    <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
                    <Text className="text-red-400 text-[13px] ml-2 flex-1">{error}</Text>
                    <TouchableOpacity onPress={fetchReviews}>
                        <Text className="text-white text-[12px] font-bold">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!loading && !error && reviews.length === 0 && (
                <View className="flex-1 items-center justify-center px-8">
                    <Ionicons name="chatbubble-outline" size={56} color="#ffffff20" />
                    <Text className="text-slate-500 text-[16px] font-semibold mt-4 text-center">
                        No reviews yet
                    </Text>
                    {!isViewingOwnProfile && (
                        <Text className="text-slate-600 text-[13px] mt-2 text-center">
                            Be the first to leave a review for this user.
                        </Text>
                    )}
                </View>
            )}

            {!loading && !error && reviews.length > 0 && (
                <FlatList
                    data={reviews}
                    keyExtractor={(item) => item.id?.toString() ?? item.reviewingUserId?.toString()}
                    renderItem={({ item }) => (
                        <ReviewCard
                            review={item}
                            currentUserId={user?.id}
                            targetUserId={parsedTargetId}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    )}
                    contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}