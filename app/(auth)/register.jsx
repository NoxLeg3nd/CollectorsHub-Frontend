import { View, Text, TextInput, TouchableOpacity, ImageBackground, ToastAndroid, KeyboardAvoidingView, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { router } from "expo-router";
import api from "../../src/services/api";

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Register() {
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
        if (!username || !email || !password || !password2) {
            ToastAndroid.show("Please fill in all fields!", ToastAndroid.SHORT);
            return;
        }
        if (!isValidEmail(email)) {
            ToastAndroid.show("Please enter a valid email address!", ToastAndroid.SHORT);
            return;
        }
        if (password !== password2) {
            ToastAndroid.show("Passwords don't match!", ToastAndroid.SHORT);
            return;
        }
        try {
            const response = await api.post("api/v1/addUser", {
                username: username,
                password: password,
                email: email,
            });
            console.log("Success!", response.data);
            ToastAndroid.show("Account created! Now login!", ToastAndroid.SHORT);
            router.replace("/(auth)/login");
        } catch (error) {
            console.log("Error:", error);
            ToastAndroid.show("User already exists or fields are empty!", ToastAndroid.SHORT);
        }
    }

    return (
        <ImageBackground source={require("../../assets/login.jpg")} resizeMode="cover" className="flex-1"
                         style={{flex: 1}}>
            <StatusBar style="light"/>
            <KeyboardAvoidingView className="flex-1" behavior="padding" keyboardVerticalOffset={0}>
                <SafeAreaView className="flex-1">
                    <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="handled">
                        <View className="flex-1 px-6 justify-center items-center w-full py-10">
                            <Animated.View
                                style={{opacity: fadeAnim, transform: [{translateY: slideAnim}]}}
                                className="px-6 justify-center w-full bg-black rounded-xl border border-white"
                            >
                                <Text className="text-[35px] font-bold text-center text-red-500 flex-wrap pt-5">
                                    Join CollectorsHub!
                                </Text>
                                <Text className="text-center text-white m-5 font-bold text-[20px]">
                                    Create your account below!
                                </Text>

                                <View>
                                    <Text className="text-left text-white font-thin mb-3">Username</Text>
                                    <TextInput
                                        className="border border-white rounded-xl px-4 py-3 mb-4 text-white"
                                        autoCapitalize="none"
                                        value={username}
                                        onChangeText={setUsername}
                                    />
                                </View>

                                <View>
                                    <Text className="text-left text-white font-thin mb-3">Email</Text>
                                    <TextInput
                                        className="border border-white rounded-xl px-4 py-3 mb-4 text-white"
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        autoComplete="email"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>

                                <View>
                                    <Text className="text-left text-white font-thin mb-3">Password</Text>
                                    <TextInput
                                        className="border border-white rounded-xl px-4 py-3 mb-4 text-white"
                                        autoCapitalize="none"
                                        autoComplete="password-new"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>

                                <View>
                                    <Text className="text-left text-white font-thin mb-3">Confirm Password</Text>
                                    <TextInput
                                        className="border border-white rounded-xl px-4 py-3 mb-4 text-white"
                                        autoCapitalize="none"
                                        autoComplete="password-new"
                                        value={password2}
                                        onChangeText={setPassword2}
                                        secureTextEntry
                                    />
                                </View>

                                <TouchableOpacity className="bg-red-500 rounded-xl py-3 px-4 items-center mb-3"
                                                  onPress={handleRegister}>
                                    <Text className="text-white font-bold text-base">Create Account</Text>
                                </TouchableOpacity>

                                <TouchableOpacity className="items-center mb-5"
                                                  onPress={() => router.replace("/(auth)/login")}>
                                    <Text className="text-white font-thin text-base">Already have an account?</Text>
                                    <Text className="text-blue-500 font-bold text-base">Sign in here!</Text>
                                </TouchableOpacity>

                            </Animated.View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}