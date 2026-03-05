import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useUser } from "../../src/context/UserContext";
import { router } from "expo-router";

export default function Profile() {

    const { user, logout } = useUser();

    function handleLogout() {
        logout();
        router.replace("/(auth)/login");
    }

    return(
        <ImageBackground source={require("../../assets/login.jpg")} resizeMode="cover" className="flex-1" style={{ flex: 1 }}>
                <SafeAreaView className="flex-1">
                    <StatusBar style="light"/>
                    <ScrollView className="flex-1">
                            <View className="mx-4 mt-6 mb-4">
                                <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">Your Stats</Text>
                                <View className="border border-white rounded-xl p-4 bg-black">
                                    <View className="flex-row justify-around">
                                        <View className="items-center flex-1 mr-2">
                                            <Text className="text-red-500 text-[24px] font-extrabold">0</Text>
                                            <Text className="text-slate-400 text-[13px] mt-1">Products</Text>
                                        </View>
                                        <View className="w-px bg-white" />
                                        <View className="items-center flex-1">
                                            <Text className="text-red-500 text-[24px] font-extrabold">0</Text>
                                            <Text className="text-slate-400 text-[13px] mt-1">Listings</Text>
                                        </View>
                                        <View className="w-px bg-white" />
                                        <View className="items-center flex-1 ml-2">
                                            <Text className="text-red-500 text-[24px] font-extrabold">0</Text>
                                            <Text className="text-slate-400 text-[13px] mt-1">Favorites</Text>
                                        </View>
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
                            <View className="mx-4 mb-4 ">
                                <Text className="text-red-500 text-[13px] font-bold uppercase mb-2 ml-1">Actions</Text>
                                <View className="rounded-xl border border-white bg-black">
                                    <TouchableOpacity className="flex-row items-center p-4 border-b border-white">
                                        <Ionicons name="create-outline" size={20} color="#ef4444" />
                                        <Text className="text-white text-[16px] ml-3">Edit Profile</Text>
                                        <Ionicons name="chevron-forward" size={20} color="#ffffff40" style={{ marginLeft: 'auto' }} />
                                    </TouchableOpacity>
                                    <TouchableOpacity className="flex-row items-center p-4 border-b border-white">
                                        <Ionicons name="lock-closed-outline" size={20} color="#ef4444" />
                                        <Text className="text-white text-[16px] ml-3">Change Password</Text>
                                        <Ionicons name="chevron-forward" size={20} color="#ffffff40" style={{ marginLeft: 'auto' }} />
                                    </TouchableOpacity>
                                    <TouchableOpacity className="flex-row items-center p-4" onPress={handleLogout}>
                                        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                                        <Text className="text-red-500 text-[16px] ml-3 font-semibold">Logout</Text>
                                        <Ionicons name="chevron-forward" size={20} color="#ffffff40" style={{ marginLeft: 'auto' }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
}