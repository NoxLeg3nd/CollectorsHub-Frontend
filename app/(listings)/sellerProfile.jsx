import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { useState, useCallback, useRef } from "react";
import { useUser } from "../../src/context/UserContext";
import api from "../../src/services/api";

const PAGE_SIZE = 10;

function ListingCard({ item, onPress }) {
    return (
        <TouchableOpacity
            className="flex-1 m-2 bg-black border border-white rounded-xl overflow-hidden"
            onPress={onPress}
            activeOpacity={0.75}
        >
            {item.product?.image ? (
                <Image
                    source={{ uri: item.product.image }}
                    style={{ width: "100%", height: 128 }}
                    resizeMode="cover"
                />
            ) : (
                <View className="w-full h-32 bg-zinc-900 items-center justify-center">
                    <Ionicons name="cube-outline" size={40} color="#ef4444" />
                </View>
            )}
            <View className="p-3">
                <Text className="text-white font-bold text-[14px]" numberOfLines={1}>
                    {item.product?.name ?? "—"}
                </Text>
                <View className="flex-row items-center mt-1">
                    <Ionicons name="pricetag-outline" size={11} color="#ef4444" />
                    <Text className="text-red-500 text-[11px] ml-1" numberOfLines={1}>
                        {item.product?.category ?? "—"}
                    </Text>
                </View>
                <View className="flex-row items-center mt-1">
                    <Ionicons name="library-outline" size={11} color="#94a3b8" />
                    <Text className="text-slate-400 text-[11px] ml-1" numberOfLines={1}>
                        {item.product?.collection ?? "—"}
                    </Text>
                </View>
                <View className="flex-row items-center mt-1">
                    <Ionicons name="phone-portrait-outline" size={11} color="#94a3b8" />
                    <Text className="text-slate-400 text-[11px] ml-1" numberOfLines={1}>
                        {item.contact ?? "—"}
                    </Text>
                </View>
                <Text className="text-red-500 text-[20px] mt-2 font-bold" numberOfLines={1}>
                    ${item.price}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export default function SellerProfile() {
    const { user } = useUser();
    const { sellerId, sellerUsername } = useLocalSearchParams();

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [totalListings, setTotalListings] = useState(0);
    const [listKey, setListKey] = useState(0);
    const loadingRef = useRef(false);
    const pageRef = useRef(0);

    const parsedSellerId = parseInt(sellerId);
    const isOwnProfile = user?.id === parsedSellerId;

    const fetchListings = useCallback(async (pageToFetch, reset = false) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        if (pageToFetch === 0) setLoading(true);
        else setLoadingMore(true);
        setError(null);
        try {
            const response = await api.get("/api/v1/getAllListingsByUserId", {
                params: { userId: parsedSellerId, page: pageToFetch, size: PAGE_SIZE },
            });
            const { content, last, totalElements } = response.data;
            setListings((prev) => {
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
            if (reset) setTotalListings(totalElements ?? 0);
        } catch (err) {
            console.error("Failed to fetch seller listings:", err);
            setError("Could not load listings. Please try again.");
        } finally {
            loadingRef.current = false;
            setLoading(false);
            setLoadingMore(false);
        }
    }, [parsedSellerId]);

    useFocusEffect(
        useCallback(() => {
            loadingRef.current = false;
            pageRef.current = 0;
            setListKey((k) => k + 1);
            setHasMore(true);
            if (parsedSellerId) fetchListings(0, true);
        }, [parsedSellerId, fetchListings])
    );

    const handleLoadMore = useCallback(() => {
        if (hasMore && !loadingRef.current) fetchListings(pageRef.current);
    }, [hasMore, fetchListings]);

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View className="py-4 items-center">
                <ActivityIndicator color="#ef4444" size="small" />
            </View>
        );
    };

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
                    <Text className="text-red-500 text-[13px] font-bold uppercase">Seller Profile</Text>
                    <Text className="text-white text-[22px] font-extrabold" numberOfLines={1}>
                        {sellerUsername ?? "User"}
                    </Text>
                </View>
            </View>

            <View className="mx-4 mt-4 mb-2">
                <View className="bg-zinc-900 border border-white rounded-xl p-4 flex-row items-center">
                    <View className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500 items-center justify-center mr-3">
                        <Ionicons name="person-outline" size={24} color="#ef4444" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-[18px] font-extrabold">
                            {sellerUsername ?? "User"}
                        </Text>
                        <Text className="text-slate-500 text-[12px]">
                            {totalListings > 0 ? `${totalListings} listing${totalListings !== 1 ? "s" : ""}` : "No listings yet"}
                        </Text>
                    </View>
                    {!isOwnProfile && (
                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: "/(reviews)/userReviews",
                                    params: { targetUserId: parsedSellerId, targetUsername: sellerUsername },
                                })
                            }
                            className="flex-row items-center bg-black border border-white rounded-lg px-3 py-2"
                            activeOpacity={0.8}
                        >
                            <Ionicons name="star-outline" size={15} color="#ef4444" />
                            <Text className="text-white text-[12px] font-bold ml-1">Reviews</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <Text className="text-red-500 text-[13px] font-bold uppercase mx-5 mb-2 mt-2">
                Active Listings
            </Text>

            {loading && (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#ef4444" size="large" />
                </View>
            )}

            {error && !loading && (
                <View className="mx-4 mt-3 p-3 bg-red-500/20 border border-red-500 rounded-xl flex-row items-center">
                    <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
                    <Text className="text-red-400 text-[13px] ml-2 flex-1">{error}</Text>
                    <TouchableOpacity onPress={() => fetchListings(0, true)}>
                        <Text className="text-white text-[12px] font-bold">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!loading && !error && listings.length === 0 && (
                <View className="flex-1 items-center justify-center px-8">
                    <Ionicons name="pricetag-outline" size={56} color="#ffffff20" />
                    <Text className="text-slate-500 text-[16px] font-semibold mt-4 text-center">
                        No listings yet
                    </Text>
                </View>
            )}

            {!loading && !error && listings.length > 0 && (
                <FlatList
                    key={listKey}
                    data={listings}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <ListingCard
                            item={item}
                            onPress={() =>
                                router.push({ pathname: "/(listings)/listingDetails", params: { id: item.id } })
                            }
                        />
                    )}
                    numColumns={2}
                    contentContainerStyle={{
                        paddingHorizontal: 6,
                        paddingTop: 4,
                        paddingBottom: 40,
                    }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={renderFooter}
                />
            )}
        </SafeAreaView>
    );
}