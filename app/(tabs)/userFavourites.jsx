import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useFocusEffect, router } from "expo-router";
import { useUser } from "../../src/context/UserContext";
import api from "../../src/services/api";

const PAGE_SIZE = 20;

function FavouriteCard({ item, onRemove, onPress }) {
    const listing = item.listing ?? {};
    const product = listing.product ?? {};

    return (
        <TouchableOpacity
            className="mx-4 mb-3 bg-zinc-900 border border-white rounded-xl overflow-hidden flex-row"
            onPress={onPress}
            activeOpacity={0.75}
        >
            {product.image ? (
                <Image
                    source={{ uri: product.image }}
                    style={{ width: 90, height: 90 }}
                    resizeMode="cover"
                />
            ) : (
                <View className="w-[90px] h-[90px] bg-black items-center justify-center border-r border-white">
                    <Ionicons name="cube-outline" size={32} color="#ef4444" />
                </View>
            )}
            <View className="flex-1 p-3 justify-between">
                <Text className="text-white text-[15px] font-bold" numberOfLines={1}>
                    {product.name ?? "Unknown"}
                </Text>
                <Text className="text-slate-500 text-[11px] uppercase tracking-widest" numberOfLines={1}>
                    {product.collection ?? product.category ?? "—"}
                </Text>
                <View className="flex-row items-center justify-between mt-1">
                    <Text className="text-slate-400 text-[12px]" numberOfLines={1}>
                        {listing.username ?? "—"}
                    </Text>
                    <Text className="text-red-500 text-[16px] font-extrabold">${listing.price}</Text>
                </View>
            </View>

            {/* Remove button */}
            <TouchableOpacity
                onPress={(e) => {
                    e.stopPropagation();
                    onRemove(item);
                }}
                className="w-12 items-center justify-center border-l border-white"
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <Ionicons name="heart-dislike-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

export default function UserFavourites() {
    const { user } = useUser();

    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    const fetchFavourites = useCallback(async (pageNum = 0, append = false) => {
        if (!user?.id) return;
        try {
            if (pageNum === 0) setLoading(true);
            else setLoadingMore(true);
            setError(null);

            const res = await api.get("/api/v1/getAllFavouritesByUserId", {
                params: { userId: user.id, page: pageNum, size: PAGE_SIZE },
            });

            const items = res.data.content ?? [];
            setFavourites((prev) => (append ? [...prev, ...items] : items));
            setHasMore(!res.data.last);
            setPage(pageNum);
        } catch (err) {
            console.error("Failed to fetch favourites:", err);
            setError("Could not load favourites. Please try again.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [user?.id]);

    useFocusEffect(
        useCallback(() => {
            fetchFavourites(0, false);
        }, [fetchFavourites])
    );

    function handleLoadMore() {
        if (!loadingMore && hasMore) {
            fetchFavourites(page + 1, true);
        }
    }

    function handleRemove(item) {
        Alert.alert(
            "Remove from Favourites",
            `Remove "${item.listing?.product?.name ?? "this item"}" from your favourites?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete("/api/v1/removeFavourite", {
                                params: { id: item.id },
                            });
                            setFavourites((prev) => prev.filter((f) => f.id !== item.id));
                        } catch (err) {
                            console.error("Remove favourite error:", err);
                        }
                    },
                },
            ]
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar style="light" />

            {/* Header */}
            <View className="px-4 pt-2 pb-3 border-b border-white">
                <Text className="text-red-500 text-[13px] font-bold uppercase">My Collection</Text>
                <Text className="text-white text-[26px] font-extrabold">Favourites</Text>
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
                    <TouchableOpacity onPress={() => fetchFavourites(0, false)}>
                        <Text className="text-white text-[12px] font-bold">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!loading && !error && favourites.length === 0 && (
                <View className="flex-1 items-center justify-center px-8">
                    <Ionicons name="heart-outline" size={64} color="#ffffff20" />
                    <Text className="text-slate-500 text-[16px] font-semibold mt-4 text-center">
                        No favourites yet
                    </Text>
                    <Text className="text-slate-600 text-[13px] mt-2 text-center">
                        Tap the heart icon on any listing in the Store to save it here.
                    </Text>
                </View>
            )}

            {!loading && !error && favourites.length > 0 && (
                <FlatList
                    data={favourites}
                    keyExtractor={(item) => item.id?.toString()}
                    renderItem={({ item }) => (
                        <FavouriteCard
                            item={item}
                            onRemove={handleRemove}
                            onPress={() =>
                                router.push({
                                    pathname: "/(listings)/listingDetails",
                                    params: { id: item.listing?.id },
                                })
                            }
                        />
                    )}
                    contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={
                        loadingMore ? (
                            <ActivityIndicator color="#ef4444" style={{ marginVertical: 16 }} />
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    );
}