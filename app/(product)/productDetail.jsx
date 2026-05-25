import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
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

export default function ProductDetail() {
    const { id } = useLocalSearchParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeListing, setActiveListing] = useState(null);

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/api/v1/getProductById", {
                params: { id },
            });
            setProduct(response.data);

            try {
                const listingIdRes = await api.get("/api/v1/getActiveListingByProductId", {
                    params: { productId: id },
                });
                if (listingIdRes.status === 200 && listingIdRes.data) {
                    const detailRes = await api.get("/api/v1/getListingById", {
                        params: { id: listingIdRes.data },
                    });
                    setActiveListing(detailRes.data);
                } else {
                    setActiveListing(null);
                }
            } catch (_) {
                setActiveListing(null);
            }
        } catch (err) {
            console.error("Failed to fetch product:", err);
            setError("Could not load product details. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            if (id) fetchProduct();
        }, [id, fetchProduct])
    );

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar style="light" />

            <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-white">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>

                <View className="flex-1">
                    <Text className="text-red-500 text-[13px] font-bold uppercase">
                        Item Details
                    </Text>
                    <Text className="text-white text-[22px] font-extrabold" numberOfLines={1}>
                        {product?.name ?? "Loading..."}
                    </Text>
                </View>

                {product && !loading && (
                    <TouchableOpacity
                        onPress={() =>
                            router.push({
                                pathname: "/(product)/editProduct",
                                params: { id: product.id },
                            })
                        }
                        className="ml-3 flex-row items-center bg-zinc-900 border border-white rounded-lg px-3 py-1.5"
                    >
                        <Ionicons name="pencil-outline" size={14} color="#ef4444" />
                        <Text className="text-white text-[13px] font-semibold ml-1">Edit</Text>
                    </TouchableOpacity>
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
                    <TouchableOpacity onPress={fetchProduct}>
                        <Text className="text-white text-[12px] font-bold">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {product && !loading && (
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
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

                    <View className="mx-4 mt-3 bg-zinc-900 border border-white rounded-xl px-2">
                        <DetailRow icon="library-outline" label="Collection" value={product.collection} />
                        <DetailRow icon="calendar-outline" label="Manufacture Year" value={product.manufactureYear?.toString()} />
                        <DetailRow icon="pricetag-outline" label="Category" value={product.category} />
                    </View>

                    {product.description && (
                        <View className="mx-4 mt-3 bg-zinc-900 border border-white rounded-xl p-4">
                            <Text className="text-red-500 text-[13px] font-semibold mb-2">
                                Description
                            </Text>
                            <Text className="text-slate-400 text-[13px] leading-5">
                                {product.description}
                            </Text>
                        </View>
                    )}

                    {activeListing ? (
                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: "/(listings)/listingDetails",
                                    params: { id: activeListing.id },
                                })
                            }
                            className="mx-4 mt-6 bg-zinc-900 border border-white rounded-xl py-4 flex-row items-center px-4"
                            activeOpacity={0.8}
                        >
                            <Ionicons name="storefront-outline" size={20} color="#ef4444" />
                            <View className="ml-3 flex-1">
                                <Text className="text-white text-[16px] font-extrabold">
                                    Go to Listing
                                </Text>
                                <Text className="text-slate-400 text-[12px]">
                                    {activeListing.isActive
                                        ? `Listed for $${activeListing.price}`
                                        : "Draft — hidden from store"}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#ffffff40" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: "/(listings)/addListings",
                                    params: {
                                        productId: product.id,
                                        productName: product.name,
                                    },
                                })
                            }
                            className="mx-4 mt-6 bg-red-500 border border-white rounded-xl py-4 flex-row items-center justify-center"
                            activeOpacity={0.8}
                        >
                            <Ionicons name="storefront-outline" size={20} color="#fff" />
                            <Text className="text-white text-[16px] font-extrabold ml-2">
                                Sell This Item
                            </Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}