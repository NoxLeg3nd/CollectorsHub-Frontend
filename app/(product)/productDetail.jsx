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

    useFocusEffect(
        useCallback(() => {
            const fetchProduct = async () => {
                try {
                    setLoading(true);
                    setError(null);
                    const response = await api.get("/api/v1/getProductById", {
                        params: { id },
                    });
                    setProduct(response.data);
                } catch (err) {
                    console.error("Failed to fetch product:", err);
                    setError("Could not load product details. Please try again.");
                } finally {
                    setLoading(false);
                }
            };

            if (id) fetchProduct();
        }, [id])
    );

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
                        Item Details
                    </Text>
                    <Text
                        className="text-white text-[22px] font-extrabold"
                        numberOfLines={1}
                    >
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
                        <Text className="text-white text-[13px] font-semibold ml-1">
                            Edit
                        </Text>
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
                    <TouchableOpacity
                        onPress={() => {
                            setLoading(true);
                            setError(null);
                        }}
                    >
                        <Text className="text-white text-[12px] font-bold">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {product && !loading && (
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

                    <View className="mx-4 mt-3 bg-zinc-900 border border-white rounded-xl px-2">
                        <DetailRow
                            icon="library-outline"
                            label="Collection"
                            value={product.collection}
                        />
                        <DetailRow
                            icon="calendar-outline"
                            label="Manufacture Year"
                            value={product.manufactureYear?.toString()}
                        />
                        <DetailRow
                            icon="pricetag-outline"
                            label="Category"
                            value={product.category}
                        />
                    </View>

                    {product.description && (
                        <View className="mx-4 mt-3 bg-zinc-900 border border-white rounded-xl p-4">
                            <View className="flex-row items-center mb-2">
                                <Ionicons
                                    name="document-text-outline"
                                    size={13}
                                    color="#ef4444"
                                />
                                <Text className="text-red-500 text-[13px] font-semibold ml-1">
                                    Description
                                </Text>
                            </View>
                            <Text className="text-slate-400 text-[13px] leading-5">
                                {product.description}
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
