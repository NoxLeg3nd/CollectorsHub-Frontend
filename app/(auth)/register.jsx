import {View, Text, TextInput, TouchableOpacity, ImageBackground, ToastAndroid, KeyboardAvoidingView, Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import api from "../../src/services/api";
import { useState, useEffect, useRef } from 'react';

export default function Register ({ navigation }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    async function handleRegister() {
        try {
            if(password == password2) {
                const response = await api.post("api/v1/addUser", {
                username: username,
                password: password,
                email: email,
            });
            console.log("Success!", response.data);
            ToastAndroid.show("Account created! Now login!", ToastAndroid.SHORT);
            navigation.navigate("Login");
            } else {
                ToastAndroid.show("Check your password! They should be the same!", ToastAndroid.SHORT);
            }
        } catch (error) {
            console.log("Error:", error);
            ToastAndroid.show("User already exists or fields are empty!", ToastAndroid.SHORT);
        }
    }

    return(
            <SafeAreaView className="flex-1 bg-black">
                <StatusBar style="light"/>
                <ScrollView className="flex-1">
                    <Text className="text-slate-400 text-[13px] font-bold uppercase mb-2 m-4">Your Stats</Text>
                        <View className="border border-white rounded-xl mb-4 mx-4">
                            <View className="flex-row justify-around mx-4 mb-6 my-4">
                                    <View className="rounded-xl p-4 items-center flex-1 mr-2 bg-neutral-900">
                                        <Text className="text-red-500 text-[24px] font-extrabold">0</Text>
                                        <Text className="text-slate-400 text-[13px] mt-1">Products</Text>
                                    </View>
                                    <View className="rounded-xl p-4 items-center flex-1 bg-neutral-900">
                                        <Text className="text-red-500 text-[24px] font-extrabold">0</Text>
                                        <Text className="text-slate-400 text-[13px] mt-1">Listings</Text>
                                    </View>
                                    <View className="rounded-xl p-4 items-center flex-1 ml-2 bg-neutral-900">
                                        <Text className="text-red-500 text-[24px] font-extrabold">0</Text>
                                        <Text className="text-slate-400 text-[13px] mt-1">Favorites</Text>
                                    </View>
                            </View>
                    </View>
    
                    <View className="mx-4 mb-4">
                        <Text className="text-slate-400 text-[13px] font-bold uppercase mb-2 ml-1">Account Details</Text>
                        <View className="bg-black rounded-xl border border-white">
                            <View className="flex-row items-center p-4 border-b border-white">
                                <Ionicons name="person-outline" size={20} color="#ef4444" />
                                <View className="ml-3">
                                    <Text className="text-slate-400 text-[12px]">Username</Text>
                                    <Text className="text-white text-[16px] font-semibold">Username</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center p-4">
                                <Ionicons name="mail-outline" size={20} color="#ef4444" />
                                <View className="ml-3">
                                    <Text className="text-slate-400 text-[12px]">Email</Text>
                                    <Text className="text-white text-[16px] font-semibold">email@example.com</Text>
                                </View>
                            </View>
                        </View>
                    </View>
    
                    <View className="mx-4 mb-4">
                        <Text className="text-slate-400 text-[13px] font-bold uppercase mb-2 ml-1">Actions</Text>
                        <View className="bg-black rounded-xl border border-white">
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
                            <TouchableOpacity className="flex-row items-center p-4">
                                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                                <Text className="text-red-500 text-[16px] ml-3 font-semibold">Logout</Text>
                                <Ionicons name="chevron-forward" size={20} color="#ffffff40" style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>
                        </View>
                    </View>
    
                </ScrollView>
            </SafeAreaView>
        );
}