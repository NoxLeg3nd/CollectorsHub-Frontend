import {
    View,
    Text,
    FlatList,
    Image,
    RefreshControl, TouchableOpacity, ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useRef } from "react";
import { useFocusEffect, router } from "expo-router";
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
                    source={{ uri: item.image }}
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

export default function Store() {
    const [listings, setListings] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [listKey, setListKey] = useState(0);

    const loadingRef = useRef(false);
    const pageRef = useRef(0);

    const fetchListings = useCallback(
        async (pageToFetch, reset = false) => {
            if (loadingRef.current) return;
            loadingRef.current = true;
            setLoading(true);
            setError(null);
            try {
                const response = await api.get("/api/v1/getAllListings", {
                    params: { page: pageToFetch, size: PAGE_SIZE },
                });
                const { content, last } = response.data;

                setListings((prev) => {
                    const combined = reset ? content : [...prev, ...content];
                    const seen = new Set();
                    return combined.filter((item) => {
                        if (seen.has(item.id)) return false;
                        seen.add(item.id);
                        return true;
                    });
                });
                console.log(response.data.content); //!!!!!!!!!!!!!!!!!!!
                setHasMore(!last);
                pageRef.current = pageToFetch + 1;
            } catch (err) {
                console.error("Failed to fetch listings:", err);
                setError("Could not load listings. Please try again.");
            } finally {
                loadingRef.current = false;
                setLoading(false);
            }
        }, []
    );

    useFocusEffect(
        useCallback(() => {
            loadingRef.current = false;
            pageRef.current = 0;
            setListKey((k) => k + 1);
            setHasMore(true);
            fetchListings(0, true);
        }, [])
    );

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        loadingRef.current = false;
        pageRef.current = 0;
        setListKey((k) => k + 1);
        setHasMore(true);
        await fetchListings(0, true);
        setRefreshing(false);
    }, [fetchListings]);

    const handleLoadMore = useCallback(() => {
        if (hasMore && !loadingRef.current) fetchListings(pageRef.current);
    }, [hasMore, fetchListings]);

    const renderItem = useCallback(
        ({ item }) => (
            <ListingCard
                item={item}
                onPress={() =>
                    router.push({
                        pathname: "/(listings)/listingDetails",
                        params: { id: item.id },
                    })
                }
            />
        ), []
    );

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View className="py-4 items-center">
                <ActivityIndicator color="#ef4444" size="small" />
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View className="flex-1 items-center justify-center mt-20 px-6">
                <Ionicons name="storefront-outline" size={64} color="#ef4444" />
                <Text className="text-white text-xl font-bold mt-4 text-center">
                    No listings yet!
                </Text>
                <Text className="text-slate-400 text-sm mt-2 text-center">
                    Be the first to list an item for sale.
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar style="light" />

            <View className="px-4 pt-2 pb-3 border-b border-white">
                <Text className="text-red-500 text-[13px] font-bold uppercase">Marketplace</Text>
                <Text className="text-white text-[26px] font-extrabold">Store</Text>
            </View>

            {error && (
                <View className="mx-4 mt-3 p-3 bg-red-500/20 border border-red-500 rounded-xl flex-row items-center">
                    <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
                    <Text className="text-red-400 text-[13px] ml-2 flex-1">{error}</Text>
                    <TouchableOpacity onPress={() => fetchListings(0, true)}>
                        <Text className="text-white text-[12px] font-bold">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View className="flex-1">
                <FlatList
                    key={listKey}
                    data={listings}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    numColumns={2}
                    contentContainerStyle={{
                        paddingHorizontal: 6,
                        paddingTop: 8,
                        paddingBottom: 88,
                        flexGrow: 1,
                    }}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#ef4444"
                            colors={["#ef4444"]}
                            progressBackgroundColor="#000"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
}
