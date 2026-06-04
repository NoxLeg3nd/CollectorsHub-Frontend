import {
    View, Text, FlatList, TouchableOpacity,
    ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useRef } from "react";
import { useFocusEffect, router } from "expo-router";
import api from "../../src/services/api";

const PAGE_SIZE = 15;

function ReviewCard({ item, onDelete }) {
    const isPositive = item.opinion === 0;
    return (
        <View className="mx-4 mb-3 bg-zinc-900 border border-white rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                    <View className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 items-center justify-center mr-2">
                        <Ionicons name="person-outline" size={14} color="#ef4444" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-[13px] font-bold" numberOfLines={1}>
                            {item.reviewingUsername ?? `User #${item.reviewingUserId}`}
                        </Text>
                        <Text className="text-slate-500 text-[11px]">
                            → reviewed User #{item.reviewedUserId}
                        </Text>
                    </View>
                </View>
                <View className={`flex-row items-center px-2 py-0.5 rounded-full border ml-2 ${isPositive ? "bg-green-500/20 border-green-500" : "bg-red-500/20 border-red-500"}`}>
                    <Ionicons
                        name={isPositive ? "thumbs-up-outline" : "thumbs-down-outline"}
                        size={11}
                        color={isPositive ? "#22c55e" : "#ef4444"}
                    />
                    <Text className={`text-[10px] font-bold ml-1 ${isPositive ? "text-green-400" : "text-red-400"}`}>
                        {isPositive ? "Positive" : "Negative"}
                    </Text>
                </View>
            </View>

            <Text className="text-slate-300 text-[13px] leading-5 mb-3">
                {item.comment}
            </Text>

            <TouchableOpacity
                onPress={() => onDelete(item)}
                className="flex-row items-center justify-center bg-red-500/20 border border-red-500 rounded-lg py-2"
                activeOpacity={0.8}
            >
                <Ionicons name="trash-outline" size={14} color="#ef4444" />
                <Text className="text-red-400 text-[12px] font-semibold ml-1">Remove Review</Text>
            </TouchableOpacity>
        </View>
    );
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const pageRef = useRef(0);

    const fetchReviews = useCallback(async (pageToFetch, reset = false) => {
        if (pageToFetch === 0) setLoading(true);
        else setLoadingMore(true);
        try {
            const res = await api.get("/api/v1/admin/getAllReviews", {
                params: { page: pageToFetch, size: PAGE_SIZE },
            });
            const { content, last } = res.data;
            setReviews((prev) => {
                const combined = reset ? content : [...prev, ...content];
                const seen = new Set();
                return combined.filter((item) => {
                    if (seen.has(item.id)) return false;
                    seen.add(item.id);
                    return true;
                });
            });
            setHasMore(!last);
            pageRef.current = pageToFetch + 1;
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        pageRef.current = 0;
        fetchReviews(0, true);
    }, [fetchReviews]));

    function handleDelete(item) {
        Alert.alert(
            "Remove Review",
            `Remove this review by "${item.reviewingUsername}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove", style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete("/api/v1/admin/deleteReview", { params: { id: item.id } });
                            setReviews((prev) => prev.filter((r) => r.id !== item.id));
                        } catch (err) {
                            console.error("Delete review error:", err);
                        }
                    },
                },
            ]
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar style="light" />

            <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-white">
                <TouchableOpacity onPress={() => router.back()} className="mr-3" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-red-500 text-[13px] font-bold uppercase">Admin Panel</Text>
                    <Text className="text-white text-[22px] font-extrabold">Reviews</Text>
                </View>
                <Text className="text-slate-500 text-[13px]">{reviews.length} loaded</Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#ef4444" size="large" />
                </View>
            ) : (
                <FlatList
                    data={reviews}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <ReviewCard item={item} onDelete={handleDelete} />
                    )}
                    contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={() => { if (hasMore && !loadingMore) fetchReviews(pageRef.current); }}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={loadingMore ? <ActivityIndicator color="#ef4444" style={{ marginVertical: 16 }} /> : null}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Ionicons name="chatbubble-outline" size={56} color="#ffffff20" />
                            <Text className="text-slate-500 text-[16px] font-semibold mt-4">No reviews found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}