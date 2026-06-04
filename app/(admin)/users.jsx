import {
    View, Text, FlatList, TouchableOpacity,
    ActivityIndicator, Alert, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useFocusEffect, router } from "expo-router";
import { useUser } from "../../src/context/UserContext";
import api from "../../src/services/api";

function UserCard({ item, currentUserId, onDelete, onPromote, onDemote }) {
    const isCurrentUser = item.id === currentUserId;
    const isAdmin = item.role === "ADMIN";

    return (
        <View className="mx-4 mb-3 bg-zinc-900 border border-white rounded-xl p-4">
            <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500 items-center justify-center mr-3">
                    <Ionicons name="person-outline" size={18} color="#ef4444" />
                </View>
                <View className="flex-1">
                    <View className="flex-row items-center">
                        <Text className="text-white text-[15px] font-bold mr-2">{item.username}</Text>
                        {isAdmin && (
                            <View className="bg-red-500/20 border border-red-500 rounded-full px-2 py-0.5">
                                <Text className="text-red-400 text-[9px] font-bold uppercase">Admin</Text>
                            </View>
                        )}
                        {isCurrentUser && (
                            <View className="bg-blue-500/20 border border-blue-500 rounded-full px-2 py-0.5 ml-1">
                                <Text className="text-blue-400 text-[9px] font-bold uppercase">You</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-slate-500 text-[12px]">{item.email}</Text>
                </View>
                <Text className="text-slate-600 text-[11px]">#{item.id}</Text>
            </View>

            {!isCurrentUser && (
                <View className="flex-row gap-2 border-t border-white/10 pt-3">
                    {isAdmin ? (
                        <TouchableOpacity
                            onPress={() => onDemote(item)}
                            className="flex-1 flex-row items-center justify-center bg-zinc-800 border border-white/30 rounded-lg py-2"
                            activeOpacity={0.8}
                        >
                            <Ionicons name="arrow-down-circle-outline" size={14} color="#94a3b8" />
                            <Text className="text-slate-400 text-[12px] font-semibold ml-1">Demote</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={() => onPromote(item)}
                            className="flex-1 flex-row items-center justify-center bg-zinc-800 border border-white/30 rounded-lg py-2"
                            activeOpacity={0.8}
                        >
                            <Ionicons name="arrow-up-circle-outline" size={14} color="#22c55e" />
                            <Text className="text-green-400 text-[12px] font-semibold ml-1">Promote</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={() => onDelete(item)}
                        className="flex-1 flex-row items-center justify-center bg-red-500/20 border border-red-500 rounded-lg py-2"
                        activeOpacity={0.8}
                    >
                        <Ionicons name="trash-outline" size={14} color="#ef4444" />
                        <Text className="text-red-400 text-[12px] font-semibold ml-1">Delete</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

export default function AdminUsers() {
    const { user: currentUser } = useUser();
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/v1/admin/getAllUsers", {
                params: { requesterId: currentUser?.id },
            });
            setUsers(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { fetchUsers(); }, [fetchUsers]));

    function handleSearch(text) {
        setSearch(text);
        if (!text.trim()) {
            setFiltered(users);
        } else {
            setFiltered(users.filter(u =>
                u.username.toLowerCase().includes(text.toLowerCase()) ||
                u.email.toLowerCase().includes(text.toLowerCase())
            ));
        }
    }

    function handleDelete(item) {
        Alert.alert(
            "Delete User",
            `Delete "${item.username}"? This will remove all their products, listings, reviews and favourites.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete("/api/v1/admin/deleteUser", {
                                params: { requesterId: currentUser?.id, id: item.id },
                            });
                            fetchUsers();
                        } catch (err) {
                            console.error("Delete user error:", err);
                        }
                    },
                },
            ]
        );
    }

    function handlePromote(item) {
        Alert.alert("Promote User", `Make "${item.username}" an admin?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Promote",
                onPress: async () => {
                    try {
                        await api.put("/api/v1/admin/promoteUser", null, {
                            params: { requesterId: currentUser?.id, id: item.id },
                        });
                        fetchUsers();
                    } catch (err) {
                        console.error("Promote error:", err);
                    }
                },
            },
        ]);
    }

    function handleDemote(item) {
        Alert.alert("Demote Admin", `Remove admin role from "${item.username}"?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Demote",
                onPress: async () => {
                    try {
                        await api.put("/api/v1/admin/demoteUser", null, {
                            params: { requesterId: currentUser?.id, id: item.id },
                        });
                        fetchUsers();
                    } catch (err) {
                        console.error("Demote error:", err);
                    }
                },
            },
        ]);
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
                    <Text className="text-white text-[22px] font-extrabold">Users</Text>
                </View>
                <Text className="text-slate-500 text-[13px]">{filtered.length} total</Text>
            </View>

            <View className="mx-4 mt-3 mb-2 flex-row items-center bg-zinc-900 border border-white rounded-xl px-4">
                <Ionicons name="search-outline" size={16} color="#ef4444" />
                <TextInput
                    className="flex-1 text-white text-[14px] py-3 ml-2"
                    placeholder="Search by username or email..."
                    placeholderTextColor="#ffffff40"
                    value={search}
                    onChangeText={handleSearch}
                    autoCapitalize="none"
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearch("")}>
                        <Ionicons name="close-circle" size={16} color="#ffffff60" />
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#ef4444" size="large" />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <UserCard
                            item={item}
                            currentUserId={currentUser?.id}
                            onDelete={handleDelete}
                            onPromote={handlePromote}
                            onDemote={handleDemote}
                        />
                    )}
                    contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Ionicons name="people-outline" size={56} color="#ffffff20" />
                            <Text className="text-slate-500 text-[16px] font-semibold mt-4">No users found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}