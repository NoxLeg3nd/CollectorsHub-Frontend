import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useRef } from "react";
import { router } from "expo-router";
import api from "../../src/services/api";

const PAGE_SIZE = 10;

function ListingCard({ item, onPress }) {
    const product = item.product ?? {};
    return (
        <TouchableOpacity
            className="flex-1 m-2 bg-black border border-white rounded-xl overflow-hidden"
            onPress={onPress}
            activeOpacity={0.75}
        >
            {product.image ? (
                <Image
                    source={{ uri: product.image }}
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
                    {product.name ?? "—"}
                </Text>
                <View className="flex-row items-center mt-1">
                    <Ionicons name="pricetag-outline" size={11} color="#ef4444" />
                    <Text className="text-red-500 text-[11px] ml-1" numberOfLines={1}>
                        {product.category ?? "—"}
                    </Text>
                </View>
                <View className="flex-row items-center mt-1">
                    <Ionicons name="library-outline" size={11} color="#94a3b8" />
                    <Text className="text-slate-400 text-[11px] ml-1" numberOfLines={1}>
                        {product.collection ?? "—"}
                    </Text>
                </View>
                <Text className="text-red-500 text-[20px] mt-2 font-bold" numberOfLines={1}>
                    ${item.price}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export default function SearchListings() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [searched, setSearched] = useState(false);
    const [listKey, setListKey] = useState(0);

    const loadingRef = useRef(false);
    const pageRef = useRef(0);
    const lastQueryRef = useRef("");

    const fetchResults = useCallback(async (searchQuery, pageToFetch, reset = false) => {
        if (!searchQuery.trim()) return;
        if (loadingRef.current) return;
        loadingRef.current = true;

        if (pageToFetch === 0) setLoading(true);
        else setLoadingMore(true);

        try {
            const response = await api.get("/api/v1/searchListings", {
                params: { query: searchQuery.trim(), page: pageToFetch, size: PAGE_SIZE },
            });
            const { content, last } = response.data;

            setResults((prev) => {
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
            setSearched(true);
        } catch (err) {
            console.error("Search listings error:", err);
        } finally {
            loadingRef.current = false;
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    function handleSearch() {
        if (!query.trim()) return;
        loadingRef.current = false;
        pageRef.current = 0;
        lastQueryRef.current = query;
        setListKey((k) => k + 1);
        setResults([]);
        setHasMore(false);
        fetchResults(query, 0, true);
    }

    function handleLoadMore() {
        if (hasMore && !loadingRef.current) {
            fetchResults(lastQueryRef.current, pageRef.current, false);
        }
    }

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
                    <Text className="text-red-500 text-[13px] font-bold uppercase">Marketplace</Text>
                    <Text className="text-white text-[22px] font-extrabold">Search Listings</Text>
                </View>
            </View>

            <View className="mx-4 mt-4 mb-3 flex-row items-center bg-zinc-900 border border-white rounded-xl px-4">
                <Ionicons name="search-outline" size={18} color="#ef4444" />
                <TextInput
                    className="flex-1 text-white text-[15px] py-3 ml-2"
                    placeholder="Search by name, category, collection..."
                    placeholderTextColor="#ffffff40"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                    autoCapitalize="none"
                    autoFocus
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => { setQuery(""); setResults([]); setSearched(false); }}>
                        <Ionicons name="close-circle" size={18} color="#ffffff60" />
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity
                onPress={handleSearch}
                className="mx-4 mb-4 bg-red-500 border border-white rounded-xl py-3 flex-row items-center justify-center"
                activeOpacity={0.8}
            >
                <Ionicons name="search" size={18} color="#fff" />
                <Text className="text-white text-[15px] font-bold ml-2">Search</Text>
            </TouchableOpacity>

            {loading && (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#ef4444" size="large" />
                </View>
            )}

            {!loading && searched && results.length === 0 && (
                <View className="flex-1 items-center justify-center px-8">
                    <Ionicons name="search-outline" size={56} color="#ffffff20" />
                    <Text className="text-slate-500 text-[16px] font-semibold mt-4 text-center">
                        No listings found
                    </Text>
                    <Text className="text-slate-600 text-[13px] mt-2 text-center">
                        Try a different name, category or collection.
                    </Text>
                </View>
            )}

            {!loading && !searched && (
                <View className="flex-1 items-center justify-center px-8">
                    <Ionicons name="storefront-outline" size={56} color="#ffffff20" />
                    <Text className="text-slate-500 text-[16px] font-semibold mt-4 text-center">
                        Search the marketplace
                    </Text>
                    <Text className="text-slate-600 text-[13px] mt-2 text-center">
                        Find listings by product name, category or collection.
                    </Text>
                </View>
            )}

            {!loading && results.length > 0 && (
                <FlatList
                    key={listKey}
                    data={results}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <ListingCard
                            item={item}
                            onPress={() =>
                                router.push({
                                    pathname: "/(listings)/listingDetails",
                                    params: { id: item.id },
                                })
                            }
                        />
                    )}
                    numColumns={2}
                    contentContainerStyle={{
                        paddingHorizontal: 6,
                        paddingTop: 4,
                        paddingBottom: 40,
                    }}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={renderFooter}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}