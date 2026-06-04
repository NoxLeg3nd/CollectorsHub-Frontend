import { View, Text, ImageBackground, ToastAndroid, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../src/context/UserContext";
import { useState } from "react";
import api from "../../src/services/api";
import { router } from "expo-router";

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function EditProfile() {

    const { user, updateUser } = useUser();

    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");

    async function handleEditProfile() {
        if (!username || !email) {
            ToastAndroid.show("Username and email fields cannot be empty!", ToastAndroid.SHORT);
            return;
        }
        if (!isValidEmail(email)) {
            ToastAndroid.show("Please enter a valid email address!", ToastAndroid.SHORT);
            return;
        }
        try {
            await api.put(`/api/v1/editUserDetails?id=${user?.id}`, {
                newUsername: username,
                newEmail: email,
            });
            updateUser({ username, email });
            ToastAndroid.show("Profile updated successfully!", ToastAndroid.SHORT);
            router.back();
        } catch (error) {
            console.log("Error:", error);
            ToastAndroid.show("Failed to update profile!", ToastAndroid.SHORT);
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
                        <Text className="text-white text-[22px] font-bold">Edit Profile</Text>
                    </View>
                    <View className="mx-4 mt-4 mb-4">
                        <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">Account Details</Text>
                        <View className="rounded-xl border border-white bg-black">
                            <View className="p-4 border-b border-white">
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="person-outline" size={18} color="#ef4444" />
                                    <Text className="text-slate-400 text-[12px] ml-2">Username</Text>
                                </View>
                                <TextInput
                                    className="text-white text-[16px] border-b border-white pb-1"
                                    autoCapitalize="none"
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholderTextColor="#ffffff60"
                                    placeholder="Enter new username"
                                />
                            </View>
                            <View className="p-4">
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="mail-outline" size={18} color="#ef4444" />
                                    <Text className="text-slate-400 text-[12px] ml-2">Email</Text>
                                </View>
                                <TextInput
                                    className="text-white text-[16px] border-b border-white pb-1"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholderTextColor="#ffffff60"
                                    placeholder="Enter new email"
                                />
                            </View>
                        </View>
                    </View>
                    <View className="mx-4 mb-4">
                        <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">Actions</Text>
                        <View className="rounded-xl border border-white bg-black">
                            <TouchableOpacity
                                className="flex-row items-center p-4 border-b border-white"
                                onPress={handleEditProfile}
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