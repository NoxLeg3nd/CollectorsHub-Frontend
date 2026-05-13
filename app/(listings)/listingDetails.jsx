import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { useUser } from "../../src/context/UserContext";
import api from "../../src/services/api";

function DetailRow({ icon, label, value }) {
    if (!value) return null;
    return (
        <View className="flex-row items-center py-3 border-b border-white">
            <View className="w-8 items-center">
                <Ionicons name={icon} size={16} color="#ef4444" />
            </View>
            <View className="ml-3 flex-1">
                <Text className="text-slate-500 text-[11px] uppercase tracking-widest">
                    {label}
                </Text>
                <Text className="text-white text-[13px] mt-0.5">{value}</Text>
            </View>
        </View>
    );
}

export default function ListingDetails() {
    const { user } = useUser();
    const { id } = useLocalSearchParams();

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewStats, setReviewStats] = useState(null);

    const fetchListing = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/api/v1/getListingById", {
                params: { id },
            });
            setListing(response.data);

            try {
                const statsRes = await api.get("/api/v1/getReviewStats", {
                    params: { userId: response.data.userId },
                });
                setReviewStats(statsRes.data);
            } catch (_) {}

        } catch (err) {
            console.error("Failed to fetch listing:", err);
            setError("Could not load listing details. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            if (id) fetchListing();
        }, [id, fetchListing])
    );

    const product = listing?.product ?? {};

    const handleContactPress = () => {
        if (!listing?.contact) return;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(listing.contact)) {
            Linking.openURL(`mailto:${listing.contact}`);
        } else {
            Linking.openURL(`tel:${listing.contact}`);
        }
    };

    const handleLinkPress = () => {
        if (!listing?.link) return;
        const url = listing.link.startsWith("http")
            ? listing.link
            : `https://${listing.link}`;
        Linking.openURL(url);
    };

    function handleDelete() {
        Alert.alert(
            "Delete Listing",
            "Are you sure you want to delete this listing? Your product will remain in your collection.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete("/api/v1/removeListing", {
                                params: { id: listing.id },
                            });
                            router.back();
                        } catch (err) {
                            console.error("Delete listing error:", err);
                            Alert.alert("Error", "Failed to delete listing. Please try again.");
                        }
                    },
                },
            ]
        );
    }

    function getScoreColor(percentage) {
        if (percentage >= 70) return "#22c55e";
        if (percentage >= 40) return "#f59e0b";
        return "#ef4444";
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
                        Listing Details
                    </Text>
                    <Text className="text-white text-[22px] font-extrabold" numberOfLines={1}>
                        {product?.name ?? "Loading..."}
                    </Text>
                </View>

                {listing && !loading && (
                    <View className="ml-3 bg-red-500 border border-white rounded-lg px-3 py-1.5">
                        <Text className="text-white text-[18px] font-extrabold">
                            ${listing.price}
                        </Text>
                    </View>
                )}
            </View>

            {loading && (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#ef4444" size="large" />
                </View>
            )}

            {error && !loading && (
                <View className="mx-4 mt-3 p-3 bg-red-500/20 border border-red-500 rounded-xl flex-row items-center">
                    <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
                    <Text className="text-red-400 text-[13px] ml-2 flex-1">{error}</Text>
                    <TouchableOpacity onPress={fetchListing}>
                        <Text className="text-white text-[12px] font-bold">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {listing && !loading && (
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {product.image ? (
                        <Image
                            source={{ uri: product.image }}
                            className="w-full h-56"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-full h-56 bg-zinc-900 items-center justify-center border-b border-white">
                            <Ionicons name="cube-outline" size={72} color="#ef4444" />
                        </View>
                    )}

                    <TouchableOpacity
                        className="mx-4 mt-4"
                        activeOpacity={0.75}
                        onPress={() =>
                            router.push({
                                pathname: "/(listings)/sellerProfile",
                                params: {
                                    sellerId: listing.userId,
                                    sellerUsername: listing.username,
                                },
                            })
                        }
                    >
                        <Text className="text-red-500 text-[11px] font-bold uppercase tracking-widest mb-2">
                            Seller
                        </Text>
                        <View className="bg-zinc-900 border border-white rounded-xl px-4 py-3 flex-row items-center">
                            <View className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500 items-center justify-center mr-3">
                                <Ionicons name="person-outline" size={20} color="#ef4444" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-500 text-[11px] uppercase tracking-widest">
                                    Username
                                </Text>
                                <Text className="text-white text-[15px] font-bold mt-0.5">
                                    {listing?.username ?? "Unknown"}
                                </Text>
                                {reviewStats && reviewStats.totalReviews > 0 && (
                                    <View className="flex-row items-center mt-1">
                                        <Ionicons
                                            name="thumbs-up-outline"
                                            size={11}
                                            color={getScoreColor(reviewStats.positivePercentage)}
                                        />
                                        <Text
                                            className="text-[11px] font-bold ml-1"
                                            style={{ color: getScoreColor(reviewStats.positivePercentage) }}
                                        >
                                            {reviewStats.positivePercentage}% positive
                                        </Text>
                                        <Text className="text-slate-600 text-[11px] ml-1">
                                            ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? "review" : "reviews"})
                                        </Text>
                                    </View>
                                )}
                                {reviewStats && reviewStats.totalReviews === 0 && (
                                    <Text className="text-slate-600 text-[11px] mt-1">No reviews yet</Text>
                                )}
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#ffffff40" />
                        </View>
                    </TouchableOpacity>

                    <View className="mx-4 mt-4">
                        <Text className="text-red-500 text-[11px] font-bold uppercase tracking-widest mb-2">
                            Item Info
                        </Text>
                        <View className="bg-zinc-900 border border-white rounded-xl px-2">
                            <DetailRow icon="library-outline" label="Collection" value={product.collection} />
                            <DetailRow icon="calendar-outline" label="Manufacture Year" value={product.manufactureYear?.toString()} />
                            <DetailRow icon="pricetag-outline" label="Category" value={product.category} />
                        </View>
                    </View>

                    <View className="mx-4 mt-4">
                        <Text className="text-red-500 text-[11px] font-bold uppercase tracking-widest mb-2">
                            Sale Info
                        </Text>
                        <View className="bg-zinc-900 border border-white rounded-xl px-2">
                            <DetailRow icon="cash-outline" label="Price" value={`$${listing.price}`} />
                            <DetailRow icon="checkmark-circle-outline" label="Status" value={listing.isActive ? "Available" : "Sold"} />
                        </View>
                    </View>

                    {listing.description && (
                        <View className="mx-4 mt-4 bg-zinc-900 border border-white rounded-xl p-4">
                            <Text className="text-red-500 text-[13px] font-semibold mb-2">
                                Seller Description
                            </Text>
                            <Text className="text-slate-400 text-[13px] leading-5">
                                {listing.description}
                            </Text>
                        </View>
                    )}

                    <View className="mx-4 mt-6 gap-3">
                        {listing.contact && (
                            <TouchableOpacity
                                onPress={handleContactPress}
                                className="flex-row items-center justify-center bg-red-500 border border-white rounded-xl py-4"
                                activeOpacity={0.8}
                            >
                                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                                <Text className="text-white text-[15px] font-bold ml-2">
                                    Contact Seller
                                </Text>
                            </TouchableOpacity>
                        )}

                        {listing.link && (
                            <TouchableOpacity
                                onPress={handleLinkPress}
                                className="flex-row items-center justify-center bg-zinc-900 border border-white rounded-xl py-4"
                                activeOpacity={0.8}
                            >
                                <Ionicons name="open-outline" size={20} color="#ef4444" />
                                <Text className="text-white text-[15px] font-bold ml-2">
                                    View External Listing
                                </Text>
                            </TouchableOpacity>
                        )}

                        {user.id === listing.userId && (
                            <TouchableOpacity
                                onPress={() =>
                                    router.push({
                                        pathname: "/(product)/productDetail",
                                        params: { id: product.id },
                                    })
                                }
                                className="flex-row items-center justify-center bg-black border border-white rounded-xl py-4"
                                activeOpacity={0.8}
                            >
                                <Ionicons name="cube-outline" size={20} color="#fff" />
                                <Text className="text-white text-[15px] font-bold ml-2">
                                    View Product Page
                                </Text>
                            </TouchableOpacity>
                        )}

                        {user.id === listing.userId && (
                            <TouchableOpacity
                                onPress={() =>
                                    router.push({
                                        pathname: "/(listings)/editListing",
                                        params: { id: listing.id },
                                    })
                                }
                                className="flex-row items-center justify-center bg-white border border-white rounded-xl py-4"
                                activeOpacity={0.8}
                            >
                                <Ionicons name="pencil-outline" size={20} color="#000" />
                                <Text className="text-black text-[15px] font-bold ml-2">
                                    Edit listing details
                                </Text>
                            </TouchableOpacity>
                        )}

                        {user.id === listing.userId && (
                            <TouchableOpacity
                                onPress={handleDelete}
                                className="flex-row items-center justify-center bg-red-500/20 border border-red-500 rounded-xl py-4"
                                activeOpacity={0.8}
                            >
                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                <Text className="text-red-400 text-[15px] font-bold ml-2">
                                    Delete Listing
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}