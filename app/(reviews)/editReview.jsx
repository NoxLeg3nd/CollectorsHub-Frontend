import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import api from "../../src/services/api";

export default function EditReview() {
    const { reviewedUserId, reviewingUserId, currentComment, currentOpinion } =
        useLocalSearchParams();

    const [comment, setComment] = useState(currentComment ?? "");
    const [opinion, setOpinion] = useState(
        currentOpinion !== undefined ? parseInt(currentOpinion) : null
    );
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        if (!comment.trim()) {
            ToastAndroid.show("Comment cannot be empty.", ToastAndroid.SHORT);
            return;
        }
        if (opinion === null) {
            ToastAndroid.show("Please select Positive or Negative.", ToastAndroid.SHORT);
            return;
        }

        setLoading(true);
        try {
            await api.put("/api/v1/editReview", {
                newComment: comment.trim(),
                newOpinion: opinion,
            }, {
                params: {
                    reviewedUserId: parseInt(reviewedUserId),
                    reviewingUserId: parseInt(reviewingUserId),
                },
            });
            ToastAndroid.show("Review updated!", ToastAndroid.SHORT);
            router.back();
        } catch (err) {
            const msg = err?.response?.data?.message ?? "Failed to update review.";
            ToastAndroid.show(msg, ToastAndroid.SHORT);
            console.error("Edit review error:", err);
        } finally {
            setLoading(false);
        }
    }

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
                        Edit Review
                    </Text>
                    <Text className="text-white text-[22px] font-extrabold">
                        Update your opinion
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="mx-4 mt-6 mb-4">
                    <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">
                        Your Opinion
                    </Text>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => setOpinion(0)}
                            activeOpacity={0.8}
                            className={`flex-1 flex-row items-center justify-center py-4 rounded-xl border ${
                                opinion === 0
                                    ? "bg-green-500/20 border-green-500"
                                    : "bg-zinc-900 border-white"
                            }`}
                        >
                            <Ionicons
                                name="thumbs-up-outline"
                                size={20}
                                color={opinion === 0 ? "#22c55e" : "#ffffff80"}
                            />
                            <Text
                                className={`ml-2 text-[15px] font-bold ${
                                    opinion === 0 ? "text-green-400" : "text-slate-400"
                                }`}
                            >
                                Positive
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setOpinion(1)}
                            activeOpacity={0.8}
                            className={`flex-1 flex-row items-center justify-center py-4 rounded-xl border ${
                                opinion === 1
                                    ? "bg-red-500/20 border-red-500"
                                    : "bg-zinc-900 border-white"
                            }`}
                        >
                            <Ionicons
                                name="thumbs-down-outline"
                                size={20}
                                color={opinion === 1 ? "#ef4444" : "#ffffff80"}
                            />
                            <Text
                                className={`ml-2 text-[15px] font-bold ${
                                    opinion === 1 ? "text-red-400" : "text-slate-400"
                                }`}
                            >
                                Negative
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="mx-4 mb-4">
                    <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">
                        Comment
                    </Text>
                    <View className="bg-zinc-900 border border-white rounded-xl p-4">
                        <TextInput
                            className="text-white text-[14px] leading-5"
                            placeholder="Write your review here..."
                            placeholderTextColor="#ffffff40"
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                            value={comment}
                            onChangeText={setComment}
                            style={{ minHeight: 100 }}
                        />
                        <Text className="text-slate-600 text-[11px] mt-2 text-right">
                            {comment.length} characters
                        </Text>
                    </View>
                </View>

                <View className="mx-4">
                    <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">
                        Actions
                    </Text>
                    <View className="rounded-xl border border-white bg-zinc-900">
                        <TouchableOpacity
                            className="flex-row items-center p-4 border-b border-white"
                            onPress={handleSave}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={loading ? "hourglass-outline" : "checkmark-circle-outline"}
                                size={20}
                                color="#ef4444"
                            />
                            <Text className="text-white text-[16px] ml-3">
                                {loading ? "Saving..." : "Save Changes"}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#ffffff40"
                                style={{ marginLeft: "auto" }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center p-4"
                            onPress={() => router.back()}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
                            <Text className="text-red-500 text-[16px] ml-3 font-semibold">Cancel</Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#ffffff40"
                                style={{ marginLeft: "auto" }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}