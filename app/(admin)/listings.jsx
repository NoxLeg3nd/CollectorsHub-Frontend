import {
    View, Text, FlatList, TouchableOpacity,
    ActivityIndicator, Alert, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useRef } from "react";
import { useFocusEffect, router } from "expo-router";
import { useUser } from "../../src/context/UserContext";
import api from "../../src/services/api";

const PAGE_SIZE = 10;

function ListingCard({ item, onDelete }) {
    const product = item.product ?? {};
    return (
        <View className="mx-4 mb-3 bg-zinc-900 border border-white rounded-xl overflow-hidden flex-row">
            {product.image ? (
                <Image source={{ uri: product.image }} style={{ width: 80, height: 80 }} resizeMode="cover" />
            ) : (
                <View className="w-[80px] h-[80px] bg-black items-center justify-center border-r border-white">
                    <Ionicons name="cube-outline" size={28} color="#ef4444" />
                </View>
            )}
            <View className="flex-1 p-3 justify-between">
                <Text className="text-white text-[14px] font-bold" numberOfLines={1}>
                    {product.name ?? "—"}
                </Text>
                <Text className="text-slate-500 text-[11px]" numberOfLines={1}>
                    @{item.username ?? "unknown"} · {product.category ?? "—"}
                </Text>
                <View className="flex-row items-center justify-between mt-1">
                    <View className={`px-2 py-0.5 rounded-full border ${item.isActive ? "border-green-500 bg-green-500/10" : "border-slate-600 bg-slate-800"}`}>
                        <Text className={`text-[10px] font-bold ${item.isActive ? "text-green-400" : "text-slate-500"}`}>
                            {item.isActive ? "Active" : "Draft"}
                        </Text>
                    </View>
                    <Text className="text-red-500 text-[15px] font-extrabold">${item.price}</Text>
                </View>
            </View>
            <TouchableOpacity
                onPress={() => onDelete(item)}
                className="w-12 items-center justify-center border-l border-white"
                activeOpacity={0.7}
            >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );
}

export default function AdminListings() {
    const { user } = useUser();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const pageRef = useRef(0);

    const fetchListings = useCallback(async (pageToFetch, reset = false) => {
        if (pageToFetch === 0) setLoading(true);
        else setLoadingMore(true);
        try {
            const res = await api.get("/api/v1/admin/getAllListings", {
                params: { requesterId: user?.id, page: pageToFetch, size: PAGE_SIZE },
            });
            const { content, last } = res.data;
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
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        pageRef.current = 0;
        fetchListings(0, true);
    }, [fetchListings]));

    function handleDelete(item) {
        Alert.alert(
            "Delete Listing",
            `Delete listing for "${item.product?.name}"? This will also remove it from all favourites.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete("/api/v1/admin/deleteListing", {
                                params: { requesterId: user?.id, id: item.id },
                            });
                            setListings((prev) => prev.filter((l) => l.id !== item.id));
                        } catch (err) {
                            console.error("Delete listing error:", err);
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
                    <Text className="text-white text-[22px] font-extrabold">Listings</Text>
                </View>
                <Text className="text-slate-500 text-[13px]">{listings.length} loaded</Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#ef4444" size="large" />
                </View>
            ) : (
                <FlatList
                    data={listings}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <ListingCard item={item} onDelete={handleDelete} />
                    )}
                    contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={() => { if (hasMore && !loadingMore) fetchListings(pageRef.current); }}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={loadingMore ? <ActivityIndicator color="#ef4444" style={{ marginVertical: 16 }} /> : null}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Ionicons name="storefront-outline" size={56} color="#ffffff20" />
                            <Text className="text-slate-500 text-[16px] font-semibold mt-4">No listings found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}