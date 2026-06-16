import { View, Text, ImageBackground, ToastAndroid, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../src/context/UserContext";
import { useState } from "react";
import api from "../../src/services/api";
import { router } from "expo-router";

export default function EditPassword() {

    const { user } = useUser();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    async function handleEditPassword() {
        if (!currentPassword || !newPassword || !confirmPassword) {
            ToastAndroid.show("Password fields cannot be empty!", ToastAndroid.SHORT);
            return;
        }
        if (newPassword.length < 8) {
            ToastAndroid.show("Password must be at least 8 characters!", ToastAndroid.SHORT);
            return;
        }
        if (newPassword === currentPassword) {
            ToastAndroid.show("Passwords must be different!", ToastAndroid.SHORT);
            return;
        }
        if (newPassword !== confirmPassword) {
            ToastAndroid.show("New passwords don't match!", ToastAndroid.SHORT);
            return;
        }
        try {
            await api.put(`/api/v1/editUserPassword?id=${user?.id}`, {
                currentPassword: currentPassword,
                newPassword: newPassword,
            });
            ToastAndroid.show("Password updated!", ToastAndroid.SHORT);
            router.back();
        } catch (error) {
            console.log("Password change failed:", error?.response?.status);
            ToastAndroid.show("Current password is incorrect!", ToastAndroid.SHORT);
        }
    }

    return (
        <ImageBackground source={require("../../assets/profile.jpg")} resizeMode="cover" className="flex-1" style={{ flex: 1 }}>
            <SafeAreaView className="flex-1">
                <StatusBar style="light" />
                <ScrollView className="flex-1">
                    <View className="mx-4 mt-6 mb-2 flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-3">
                            <Ionicons name="arrow-back" size={22} color="#ef4444" />
                        </TouchableOpacity>
                        <Text className="text-white text-[22px] font-bold">Change Password</Text>
                    </View>
                    <View className="mx-4 mt-4 mb-4">
                        <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">Password Details</Text>
                        <View className="rounded-xl border border-white bg-black">
                            <View className="p-4 border-b border-white">
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="lock-closed-outline" size={18} color="#ef4444" />
                                    <Text className="text-slate-400 text-[12px] ml-2">Current Password</Text>
                                </View>
                                <TextInput
                                    className="text-white text-[16px] border-b border-white pb-1"
                                    autoCapitalize="none"
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholderTextColor="#ffffff60"
                                    placeholder="Enter current password"
                                    secureTextEntry
                                />
                            </View>
                            <View className="p-4 border-b border-white">
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="lock-open-outline" size={18} color="#ef4444" />
                                    <Text className="text-slate-400 text-[12px] ml-2">New Password</Text>
                                </View>
                                <TextInput
                                    className="text-white text-[16px] border-b border-white pb-1"
                                    autoCapitalize="none"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholderTextColor="#ffffff60"
                                    placeholder="Enter new password"
                                    secureTextEntry
                                />
                            </View>
                            <View className="p-4">
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="shield-checkmark-outline" size={18} color="#ef4444" />
                                    <Text className="text-slate-400 text-[12px] ml-2">Confirm New Password</Text>
                                </View>
                                <TextInput
                                    className="text-white text-[16px] border-b border-white pb-1"
                                    autoCapitalize="none"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholderTextColor="#ffffff60"
                                    placeholder="Confirm new password"
                                    secureTextEntry
                                />
                            </View>
                        </View>
                    </View>
                    <View className="mx-4 mb-4">
                        <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">Actions</Text>
                        <View className="rounded-xl border border-white bg-black">
                            <TouchableOpacity
                                className="flex-row items-center p-4 border-b border-white"
                                onPress={handleEditPassword}
                            >
                                <Ionicons name="checkmark-circle-outline" size={20} color="#ef4444" />
                                <Text className="text-white text-[16px] ml-3">Save Changes</Text>
                                <Ionicons name="chevron-forward" size={20} color="#ffffff40" style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-row items-center p-4"
                                onPress={() => router.back()}
                            >
                                <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
                                <Text className="text-red-500 text-[16px] ml-3 font-semibold">Cancel</Text>
                                <Ionicons name="chevron-forward" size={20} color="#ffffff40" style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
}