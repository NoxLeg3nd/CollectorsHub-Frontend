import { View, Text, ScrollView, TouchableOpacity, ImageBackground, Alert, ToastAndroid } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useUser } from "../../src/context/UserContext";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import api from "../../src/services/api";

export default function Profile() {

    const { user, logout } = useUser();

    const [productsCount, setProductsCount] = useState(0);
    const [listingsCount, setListingsCount] = useState(0);
    const [favouritesCount, setFavouritesCount] = useState(0);

    useFocusEffect(
        useCallback(() => {
            if (!user?.id) return;

            async function fetchStats() {
                try {
                    const [productsRes, listingsRes, favouritesRes] = await Promise.all([
                        api.get("/api/v1/getAllProductsByUserId", { params: { userId: user.id, page: 0, size: 1 } }),
                        api.get("/api/v1/getAllListingsByUserId", { params: { userId: user.id, page: 0, size: 1 } }),
                        api.get("/api/v1/getAllFavouritesByUserId", { params: { userId: user.id, page: 0, size: 1 } }),
                    ]);
                    setProductsCount(productsRes.data.totalElements ?? 0);
                    setListingsCount(listingsRes.data.totalElements ?? 0);
                    setFavouritesCount(favouritesRes.data.totalElements ?? 0);
                } catch (err) {
                    console.error("Failed to fetch profile stats:", err);
                }
            }

            fetchStats();
        }, [user?.id])
    );

    function handleLogout() {
        logout();
        router.replace("/(auth)/login");
    }

    function handleDeleteAccount() {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This will permanently remove all your products, listings, favourites and reviews. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete("/api/v1/deleteUser", {
                                params: { id: user.id },
                            });
                            ToastAndroid.show("Account deleted", ToastAndroid.SHORT);
                            logout();
                            router.replace("/(auth)/login");
                        } catch (err) {
                            console.error("Failed to delete account:", err);
                            ToastAndroid.show("Failed to delete account", ToastAndroid.SHORT);
                        }
                    },
                },
            ]
        );
    }

    return (
        <ImageBackground source={require("../../assets/profile.jpg")} resizeMode="cover" className="flex-1" style={{ flex: 1 }}>
            <SafeAreaView className="flex-1">
                <StatusBar style="light" />
                <ScrollView className="flex-1">
                    <View className="mx-4 mt-6 mb-4">
                        <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">Your Stats</Text>
                        <View className="border border-white rounded-xl bg-black overflow-hidden">
                            <View className="flex-row">
                                <TouchableOpacity
                                    className="items-center flex-1 py-4"
                                    activeOpacity={0.6}
                                    onPress={() => router.push("/(tabs)/home")}
                                >
                                    <Text className="text-red-500 text-[24px] font-extrabold">{productsCount}</Text>
                                    <Text className="text-slate-400 text-[13px] mt-1">Products</Text>
                                </TouchableOpacity>

                                <View className="w-px bg-white" />

                                <TouchableOpacity
                                    className="items-center flex-1 py-4"
                                    activeOpacity={0.6}
                                    onPress={() =>
                                        router.push({
                                            pathname: "/(listings)/sellerProfile",
                                            params: { sellerId: user?.id, sellerUsername: user?.username },
                                        })
                                    }
                                >
                                    <Text className="text-red-500 text-[24px] font-extrabold">{listingsCount}</Text>
                                    <Text className="text-slate-400 text-[13px] mt-1">Listings</Text>
                                </TouchableOpacity>

                                <View className="w-px bg-white" />

                                <TouchableOpacity
                                    className="items-center flex-1 py-4"
                                    activeOpacity={0.6}
                                    onPress={() => router.push("/(tabs)/userFavourites")}
                                >
                                    <Text className="text-red-500 text-[24px] font-extrabold">{favouritesCount}</Text>
                                    <Text className="text-slate-400 text-[13px] mt-1">Favorites</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View className="mx-4 mb-4">
                        <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">Account Details</Text>
                        <View className="rounded-xl border border-white bg-black">
                            <View className="flex-row items-center p-4 border-b border-white">
                                <Ionicons name="person-outline" size={20} color="#ef4444" />
                                <View className="ml-3">
                                    <Text className="text-slate-400 text-[12px]">Username</Text>
                                    <Text className="text-white text-[16px] font-semibold">{user?.username}</Text>
                                </View>
                                {user?.role === "ADMIN" && (
                                    <View className="ml-auto bg-red-500/20 border border-red-500 rounded-full px-2 py-0.5">
                                        <Text className="text-red-400 text-[10px] font-bold uppercase">Admin</Text>
                                    </View>
                                )}
                            </View>
                            <View className="flex-row items-center p-4">
                                <Ionicons name="mail-outline" size={20} color="#ef4444" />
                                <View className="ml-3">
                                    <Text className="text-slate-400 text-[12px]">Email</Text>
                                    <Text className="text-white text-[16px] font-semibold">{user?.email}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View className="mx-4 mb-4">
                        <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">Actions</Text>
                        <View className="rounded-xl border border-white bg-black">
                            <TouchableOpacity className="flex-row items-center p-4 border-b border-white" onPress={() => router.push("/(profile)/editProfile")}>
                                <Ionicons name="create-outline" size={20} color="#ef4444" />
                                <Text className="text-white text-[16px] ml-3">Edit Profile</Text>
                                <Ionicons name="chevron-forward" size={20} color="#ffffff40" style={{ marginLeft: "auto" }} />
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-row items-center p-4 border-b border-white" onPress={() => router.push("/(profile)/editPassword")}>
                                <Ionicons name="lock-closed-outline" size={20} color="#ef4444" />
                                <Text className="text-white text-[16px] ml-3">Change Password</Text>
                                <Ionicons name="chevron-forward" size={20} color="#ffffff40" style={{ marginLeft: "auto" }} />
                            </TouchableOpacity>
                            {user?.role === "ADMIN" && (
                                <TouchableOpacity
                                    className="flex-row items-center p-4 border-b border-white"
                                    onPress={() => router.push("/(admin)/dashboard")}
                                >
                                    <Ionicons name="shield-checkmark-outline" size={20} color="#ef4444" />
                                    <Text className="text-white text-[16px] ml-3">Admin Panel</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#ffffff40" style={{ marginLeft: "auto" }} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity className="flex-row items-center p-4 border-b border-white" onPress={handleLogout}>
                                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                                <Text className="text-red-500 text-[16px] ml-3 font-semibold">Logout</Text>
                                <Ionicons name="chevron-forward" size={20} color="#ffffff40" style={{ marginLeft: "auto" }} />
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-row items-center p-4" onPress={handleDeleteAccount}>
                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                <Text className="text-red-500 text-[16px] ml-3 font-semibold">Delete Account</Text>
                                <Ionicons name="chevron-forward" size={20} color="#ffffff40" style={{ marginLeft: "auto" }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
}