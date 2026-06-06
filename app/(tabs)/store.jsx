import {
    View,
    Text,
    Image,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useRef, useMemo } from "react";
import { useFocusEffect, router } from "expo-router";
import { useUser } from "../../src/context/UserContext";
import api from "../../src/services/api";
import { CATEGORIES } from "../../src/components/categories";

const PAGE_SIZE = 10;

function ListingCard({ item, isFavourited, onPress, onToggleFavourite }) {
    return (
        <TouchableOpacity
            style={{ flex: 1, margin: 6 }}
            className="bg-black border border-white rounded-xl overflow-hidden"
            onPress={onPress}
            activeOpacity={0.75}
        >
            <View className="relative">
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
                <TouchableOpacity
                    onPress={(e) => { e.stopPropagation(); onToggleFavourite(item); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 items-center justify-center border border-white"
                    activeOpacity={0.8}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                    <Ionicons
                        name={isFavourited ? "heart" : "heart-outline"}
                        size={16}
                        color={isFavourited ? "#ef4444" : "#ffffff"}
                    />
                </TouchableOpacity>
            </View>
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

function RecommendationCard({ item, isFavourited, onPress, onToggleFavourite }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={{ width: 160, marginRight: 12 }}
            className="bg-black border border-white/30 rounded-xl overflow-hidden"
        >
            <View className="relative">
                {item.product?.image ? (
                    <Image
                        source={{ uri: item.product.image }}
                        style={{ width: "100%", height: 110 }}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={{ width: "100%", height: 110 }} className="bg-zinc-800 items-center justify-center">
                        <Ionicons name="cube-outline" size={32} color="#ef4444" />
                    </View>
                )}
                <TouchableOpacity
                    onPress={(e) => { e.stopPropagation(); onToggleFavourite(item); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 items-center justify-center border border-white"
                    activeOpacity={0.8}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                    <Ionicons
                        name={isFavourited ? "heart" : "heart-outline"}
                        size={13}
                        color={isFavourited ? "#ef4444" : "#ffffff"}
                    />
                </TouchableOpacity>
            </View>
            <View className="p-2">
                <Text className="text-white font-bold text-[13px]" numberOfLines={1}>
                    {item.product?.name ?? "—"}
                </Text>
                <Text className="text-red-500 text-[11px] mt-0.5" numberOfLines={1}>
                    {item.product?.category ?? "—"}
                </Text>
                <Text className="text-red-500 text-[15px] font-extrabold mt-1">
                    ${item.price}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

function ListingsGrid({ listings, favouriteMap, togglingIds, onPress, onToggleFavourite }) {
    const rows = [];
    for (let i = 0; i < listings.length; i += 2) {
        rows.push(
            <View key={i} style={{ flexDirection: "row", paddingHorizontal: 6 }}>
                <ListingCard
                    item={listings[i]}
                    isFavourited={!!favouriteMap[listings[i].id]}
                    onPress={() => onPress(listings[i])}
                    onToggleFavourite={onToggleFavourite}
                />
                {listings[i + 1] ? (
                    <ListingCard
                        item={listings[i + 1]}
                        isFavourited={!!favouriteMap[listings[i + 1].id]}
                        onPress={() => onPress(listings[i + 1])}
                        onToggleFavourite={onToggleFavourite}
                    />
                ) : (
                    <View style={{ flex: 1, margin: 6 }} />
                )}
            </View>
        );
    }
    return <>{rows}</>;
}

export default function Store() {
    const { user } = useUser();

    const [listings, setListings] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const pageRef = useRef(0);

    const [recommendations, setRecommendations] = useState([]);
    const [recsLoading, setRecsLoading] = useState(false);

    const [favouriteMap, setFavouriteMap] = useState({});
    const [favouriteCount, setFavouriteCount] = useState(0);
    const [togglingIds, setTogglingIds] = useState(new Set());
    const favLoadingRef = useRef(false);

    const fetchRecommendations = useCallback(async () => {
        if (!user?.id) return;
        setRecsLoading(true);
        try {
            const res = await api.get("/api/v1/getRecommendations", {
                params: { userId: user.id, limit: 10 },
            });
            setRecommendations(res.data ?? []);
        } catch (err) {
            console.error("Failed to fetch recommendations:", err);
        } finally {
            setRecsLoading(false);
        }
    }, [user?.id]);

    const fetchFavouritesPage = useCallback(async (pageToFetch, reset = false) => {
        if (!user?.id) return;
        if (favLoadingRef.current) return;
        favLoadingRef.current = true;
        try {
            const res = await api.get("/api/v1/getAllFavouritesByUserId", {
                params: { userId: user.id, page: pageToFetch, size: PAGE_SIZE },
            });
            const items = res.data.content ?? [];
            setFavouriteMap((prev) => {
                const base = reset ? {} : { ...prev };
                items.forEach((fav) => { base[fav.listing.id] = fav.id; });
                return base;
            });
            if (reset) setFavouriteCount(res.data.totalElements ?? 0);
            favLoadingRef.current = false;
            if (!res.data.last) fetchFavouritesPage(pageToFetch + 1, false);
        } catch (err) {
            console.error("Failed to fetch favourites page:", err);
            favLoadingRef.current = false;
        }
    }, [user?.id]);

    const fetchListings = useCallback(async (pageToFetch, reset = false) => {
        if (reset) setLoading(true);
        else setLoadingMore(true);
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
            setHasMore(!last);
            pageRef.current = pageToFetch + 1;
        } catch (err) {
            console.error("Failed to fetch listings:", err);
            setError("Could not load listings. Please try again.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            pageRef.current = 0;
            favLoadingRef.current = false;
            setHasMore(true);
            setSelectedCategory(null);
            fetchListings(0, true);
            fetchFavouritesPage(0, true);
            fetchRecommendations();
        }, [fetchListings, fetchFavouritesPage, fetchRecommendations])
    );

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        pageRef.current = 0;
        favLoadingRef.current = false;
        setHasMore(true);
        setSelectedCategory(null);
        await Promise.all([
            fetchListings(0, true),
            fetchFavouritesPage(0, true),
            fetchRecommendations(),
        ]);
        setRefreshing(false);
    }, [fetchListings, fetchFavouritesPage, fetchRecommendations]);

    async function handleToggleFavourite(item) {
        if (!user?.id) return;
        if (togglingIds.has(item.id)) return;
        setTogglingIds((prev) => new Set(prev).add(item.id));
        const existingFavId = favouriteMap[item.id];
        try {
            if (existingFavId) {
                await api.delete("/api/v1/removeFavourite", { params: { id: existingFavId } });
                setFavouriteMap((prev) => {
                    const next = { ...prev };
                    delete next[item.id];
                    return next;
                });
                setFavouriteCount((c) => Math.max(0, c - 1));
            } else {
                await api.post("/api/v1/addFavourite", { userId: user.id, listingId: item.id });
                const res = await api.get("/api/v1/getAllFavouritesByUserId", {
                    params: { userId: user.id, page: 0, size: 50 },
                });
                const match = (res.data.content ?? []).find((f) => f.listing.id === item.id);
                if (match) setFavouriteMap((prev) => ({ ...prev, [item.id]: match.id }));
                setFavouriteCount((c) => c + 1);
            }
        } catch (err) {
            console.error("Toggle favourite error:", err);
        } finally {
            setTogglingIds((prev) => {
                const next = new Set(prev);
                next.delete(item.id);
                return next;
            });
        }
    }

    const filteredListings = useMemo(() => {
        if (!selectedCategory) return listings;
        return listings.filter((l) => l.product?.category === selectedCategory);
    }, [listings, selectedCategory]);

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar style="light" />

            <View className="flex-row items-center justify-between px-4 pt-2 pb-3 border-b border-white">
                <View>
                    <Text className="text-red-500 text-[13px] font-bold uppercase">Marketplace</Text>
                    <Text className="text-white text-[26px] font-extrabold">Store</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push("/(listings)/searchListings")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="search-outline" size={24} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
                className="border-b border-white/10 max-h-14"
            >
                <TouchableOpacity
                    onPress={() => setSelectedCategory(null)}
                    className={`px-4 py-1.5 rounded-full border ${!selectedCategory ? "bg-red-500 border-red-500" : "bg-black border-white"}`}
                    activeOpacity={0.7}
                >
                    <Text className={`text-[12px] font-bold ${!selectedCategory ? "text-white" : "text-slate-400"}`}>
                        All
                    </Text>
                </TouchableOpacity>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                        className={`px-4 py-1.5 rounded-full border ${selectedCategory === cat ? "bg-red-500 border-red-500" : "bg-black border-white"}`}
                        activeOpacity={0.7}
                    >
                        <Text className={`text-[12px] font-bold ${selectedCategory === cat ? "text-white" : "text-slate-400"}`}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

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
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#ef4444"
                            colors={["#ef4444"]}
                            progressBackgroundColor="#000"
                        />
                    }
                >
                    {!selectedCategory && (recommendations.length > 0 || recsLoading) && (
                        <View className="mx-4 mt-4 mb-2 bg-zinc-900 border border-white/20 rounded-2xl overflow-hidden">
                            <View className="flex-row items-center px-4 pt-4 pb-2">
                                <Ionicons name="sparkles" size={16} color="#ef4444" />
                                <Text className="text-red-500 text-[13px] font-bold uppercase ml-2">For You</Text>
                                <Text className="text-slate-600 text-[11px] ml-2">swipe to explore →</Text>
                            </View>
                            {recsLoading ? (
                                <ActivityIndicator color="#ef4444" style={{ marginVertical: 30 }} />
                            ) : (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 14 }}
                                >
                                    {recommendations.map((item) => (
                                        <RecommendationCard
                                            key={item.id}
                                            item={item}
                                            isFavourited={!!favouriteMap[item.id]}
                                            onPress={() =>
                                                router.push({ pathname: "/(listings)/listingDetails", params: { id: item.id } })
                                            }
                                            onToggleFavourite={handleToggleFavourite}
                                        />
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    )}

                    <View className="px-4 pt-2 pb-1 flex-row items-center justify-between">
                        <Text className="text-white text-[18px] font-extrabold">
                            {selectedCategory ? selectedCategory : "All Listings"}
                        </Text>
                        {selectedCategory && (
                            <Text className="text-slate-500 text-[12px]">
                                {filteredListings.length} result{filteredListings.length !== 1 ? "s" : ""}
                            </Text>
                        )}
                    </View>

                    {loading ? (
                        <View className="items-center justify-center py-20">
                            <ActivityIndicator color="#ef4444" size="large" />
                        </View>
                    ) : filteredListings.length === 0 ? (
                        <View className="items-center justify-center mt-20 px-6">
                            <Ionicons name="storefront-outline" size={64} color="#ef4444" />
                            <Text className="text-white text-xl font-bold mt-4 text-center">
                                {selectedCategory ? `No listings in "${selectedCategory}"` : "No listings yet!"}
                            </Text>
                            <Text className="text-slate-400 text-sm mt-2 text-center">
                                {selectedCategory ? "Try a different category." : "Be the first to list an item for sale."}
                            </Text>
                        </View>
                    ) : (
                        <ListingsGrid
                            listings={filteredListings}
                            favouriteMap={favouriteMap}
                            togglingIds={togglingIds}
                            onPress={(item) => router.push({ pathname: "/(listings)/listingDetails", params: { id: item.id } })}
                            onToggleFavourite={handleToggleFavourite}
                        />
                    )}

                    {!selectedCategory && hasMore && !loading && (
                        <TouchableOpacity
                            onPress={() => fetchListings(pageRef.current)}
                            disabled={loadingMore}
                            className="mx-4 mt-2 mb-4 py-3 border border-white rounded-xl flex-row items-center justify-center"
                            activeOpacity={0.8}
                        >
                            {loadingMore ? (
                                <ActivityIndicator color="#ef4444" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="chevron-down" size={18} color="#ef4444" />
                                    <Text className="text-white text-[14px] font-semibold ml-2">Load More</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </ScrollView>

                <TouchableOpacity
                    onPress={() => router.push("/(tabs)/userFavourites")}
                    style={{
                        position: "absolute",
                        bottom: 24,
                        right: 20,
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: "#ef4444",
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 2,
                        borderColor: "#fff",
                        elevation: 6,
                        shadowColor: "#ef4444",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 6,
                    }}
                >
                    <Ionicons name="heart" size={26} color="#fff" />
                    {favouriteCount > 0 && (
                        <View style={{
                            position: "absolute",
                            top: -4,
                            right: -4,
                            backgroundColor: "#000",
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: "#fff",
                            minWidth: 18,
                            height: 18,
                            alignItems: "center",
                            justifyContent: "center",
                            paddingHorizontal: 3,
                        }}>
                            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
                                {favouriteCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}