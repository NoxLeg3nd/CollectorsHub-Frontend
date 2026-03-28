import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useRef } from "react";
import { useFocusEffect, router } from "expo-router";
import { useUser } from "../../src/context/UserContext";
import api from "../../src/services/api";

const PAGE_SIZE = 10;

function ProductCard({ item, onPress }) {
    return (
        <TouchableOpacity
            className="flex-1 m-2 bg-black border border-white rounded-xl overflow-hidden"
            onPress={onPress}
            activeOpacity={0.75}
        >
            {item.image ? (
                <Image
                    source={{ uri: item.image }}
                    className="w-full h-32"
                    resizeMode="cover"
                />
            ) : (
                <View className="w-full h-32 bg-zinc-900 items-center justify-center">
                    <Ionicons name="cube-outline" size={40} color="#ef4444" />
                </View>
            )}
            <View className="p-3">
                <Text
                    className="text-white font-bold text-[14px]"
                    numberOfLines={1}
                >
                    {item.name}
                </Text>
                <View className="flex-row items-center mt-1">
                    <Ionicons name="pricetag-outline" size={11} color="#ef4444" />
                    <Text className="text-red-500 text-[11px] ml-1" numberOfLines={1}>
                        {item.category}
                    </Text>
                </View>
                <View className="flex-row items-center mt-1">
                    <Ionicons name="library-outline" size={11} color="#94a3b8" />
                    <Text className="text-slate-400 text-[11px] ml-1" numberOfLines={1}>
                        {item.collection}
                    </Text>
                </View>
                <View className="flex-row items-center mt-1">
                    <Ionicons name="calendar-outline" size={11} color="#94a3b8" />
                    <Text className="text-slate-400 text-[11px] ml-1">
                        {item.manufactureYear}
                    </Text>
                </View>
                <Text
                    className="text-slate-500 text-[11px] mt-2"
                    numberOfLines={2}
                >
                    {item.description}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export default function Home() {
    const { user } = useUser();

    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const loadingRef = useRef(false);

    const fetchProducts = useCallback(
        async (pageToFetch, reset = false) => {
            if (!user?.id) return;
            if (loadingRef.current) return;

            loadingRef.current = true;
            setLoading(true);
            setError(null);

            try {
                const response = await api.get("/api/v1/getAllProductsByUserId", {
                    params: {
                        userId: user.id,
                        page: pageToFetch,
                        size: PAGE_SIZE,
                    },
                });

                const { content, last, totalElements } = response.data;

                setProducts((prev) => (reset ? content : [...prev, ...content]));
                setHasMore(!last);
                setPage(pageToFetch + 1);
                if (reset) setTotalItems(totalElements ?? 0);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setError("Could not load your collection. Please try again.");
            } finally {
                loadingRef.current = false;
                setLoading(false);
            }
        },
        [user?.id]
    );

    useFocusEffect(
        useCallback(() => {
            setProducts([]);
            setPage(0);
            setHasMore(true);
            fetchProducts(0, true);
        }, [user?.id])
    );

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        setPage(0);
        setHasMore(true);
        await fetchProducts(0, true);
        setRefreshing(false);
    }, [fetchProducts]);

    const handleLoadMore = useCallback(() => {
        if (hasMore && !loadingRef.current) {
            fetchProducts(page);
        }
    }, [hasMore, page, fetchProducts]);

    const renderItem = useCallback(
        ({ item }) => (
            <ProductCard
                item={item}
                onPress={() =>
                    router.push({
                        pathname: "/(product)/productDetail",
                        params: { id: item.id },
                    })
                }
            />
        ),
        []
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
                <Ionicons name="cube-outline" size={64} color="#ef4444" />
                <Text className="text-white text-xl font-bold mt-4 text-center">
                    No items yet
                </Text>
                <Text className="text-slate-400 text-sm mt-2 text-center">
                    Your collection is empty. Start adding products!
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar style="light" />
            <View className="flex-row items-center justify-between px-4 pt-2 pb-4 border-b border-white">
                <View>
                    <Text className="text-red-500 text-[13px] font-bold uppercase">
                        My Collection
                    </Text>
                    <Text className="text-white text-[22px] font-extrabold">
                        {user?.username ?? "Collector"}
                    </Text>
                    <Text className="text-slate-400 text-[12px] mt-0.5">
                        {totalItems} {totalItems === 1 ? "item" : "items"} in your collection
                    </Text>
                </View>
            </View>

            {error && (
                <View className="mx-4 mt-3 p-3 bg-red-500/20 border border-red-500 rounded-xl flex-row items-center">
                    <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
                    <Text className="text-red-400 text-[13px] ml-2 flex-1">{error}</Text>
                    <TouchableOpacity onPress={() => fetchProducts(0, true)}>
                        <Text className="text-white text-[12px] font-bold">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View className="flex-1">
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
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

                <TouchableOpacity
                    onPress={() => router.push("/(product)/addProduct")}
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
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
