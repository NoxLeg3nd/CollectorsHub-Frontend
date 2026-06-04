import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useFocusEffect, router } from "expo-router";
import { useUser } from "../../src/context/UserContext";
import api from "../../src/services/api";

function StatCard({ icon, label, value, color }) {
    return (
        <View className="flex-1 m-2 bg-zinc-900 border border-white rounded-xl p-4 items-center">
            <Ionicons name={icon} size={28} color={color ?? "#ef4444"} />
            <Text className="text-white text-[26px] font-extrabold mt-2">{value ?? "—"}</Text>
            <Text className="text-slate-400 text-[12px] mt-1 text-center">{label}</Text>
        </View>
    );
}

function NavCard({ icon, label, description, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="mx-4 mb-3 bg-zinc-900 border border-white rounded-xl p-4 flex-row items-center"
            activeOpacity={0.75}
        >
            <View className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500 items-center justify-center mr-3">
                <Ionicons name={icon} size={20} color="#ef4444" />
            </View>
            <View className="flex-1">
                <Text className="text-white text-[16px] font-bold">{label}</Text>
                <Text className="text-slate-500 text-[12px] mt-0.5">{description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ffffff40" />
        </TouchableOpacity>
    );
}

export default function AdminDashboard() {
    const { user } = useUser();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            async function fetchStats() {
                try {
                    setLoading(true);
                    const res = await api.get("/api/v1/admin/getStats", {
                        params: { requesterId: user?.id },
                    });
                    setStats(res.data);
                } catch (err) {
                    console.error("Failed to fetch admin stats:", err);
                } finally {
                    setLoading(false);
                }
            }
            fetchStats();
        }, [])
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
                    <Text className="text-red-500 text-[13px] font-bold uppercase">Admin Panel</Text>
                    <Text className="text-white text-[22px] font-extrabold">Dashboard</Text>
                </View>
                <View className="bg-red-500/20 border border-red-500 rounded-full px-3 py-1">
                    <Text className="text-red-400 text-[11px] font-bold uppercase">Admin</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="mx-4 mt-4 mb-2">
                    <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">Platform Stats</Text>
                    {loading ? (
                        <View className="items-center py-10">
                            <ActivityIndicator color="#ef4444" size="large" />
                        </View>
                    ) : (
                        <>
                            <View className="flex-row">
                                <StatCard icon="people-outline" label="Total Users" value={stats?.totalUsers} />
                                <StatCard icon="cube-outline" label="Products" value={stats?.totalProducts} />
                            </View>
                            <View className="flex-row">
                                <StatCard icon="storefront-outline" label="Listings" value={stats?.totalListings} />
                                <StatCard icon="checkmark-circle-outline" label="Active Listings" value={stats?.activeListings} color="#22c55e" />
                            </View>
                            <View className="flex-row">
                                <StatCard icon="chatbubble-outline" label="Reviews" value={stats?.totalReviews} />
                                <StatCard icon="heart-outline" label="Favourites" value={stats?.totalFavourites} color="#f59e0b" />
                            </View>
                        </>
                    )}
                </View>

                <View className="mt-2">
                    <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-5">Manage</Text>
                    <NavCard
                        icon="people-outline"
                        label="Users"
                        description="View, promote or delete users"
                        onPress={() => router.push("/(admin)/users")}
                    />
                    <NavCard
                        icon="storefront-outline"
                        label="Listings"
                        description="View and remove any listing"
                        onPress={() => router.push("/(admin)/listings")}
                    />
                    <NavCard
                        icon="chatbubble-outline"
                        label="Reviews"
                        description="Moderate and remove reviews"
                        onPress={() => router.push("/(admin)/reviews")}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}