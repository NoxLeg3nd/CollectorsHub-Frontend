import {View, Text, TextInput, TouchableOpacity, ImageBackground, ToastAndroid, KeyboardAvoidingView, Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import api from "../services/api";
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

    return (
        <ImageBackground source={require("../../assets/login.jpg")} resizeMode="cover" className="flex-1" style={{ flex: 1 }}>
            <StatusBar style="light"/>
                <SafeAreaView className="flex-1">
                    <KeyboardAvoidingView className="flex-1" behavior="padding" keyboardVerticalOffset={0}>
                        <View className="flex-1 px-6 justify-center items-center w-full">
                            <Animated.View 
                                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                                className="px-6 justify-center w-full bg-black rounded-xl border border-white"
                            >
                                <Text className="text-[35px] font-bold text-center text-red-500 flex-wrap pt-5">
                                    Make a new account!
                                </Text>
                                <Text className="text-center text-white m-5 font-bold text-[20px]">
                                    Please enter your desired credentials to be used for logging in!
                                </Text>
                                <View>
                                    <Text className="text-left text-white font-thin mb-3">
                                        Email
                                    </Text>
                                    <TextInput className="border border-white rounded-xl px-4 py-3 mb-4 text-white" autoCapitalize="none"
                                    keyboardType="email-address" value={email} onChangeText={setEmail}/>
                                </View>
                                <View>
                                    <Text className="text-left text-white font-thin mb-3">
                                        Username
                                    </Text>
                                    <TextInput className="border border-white rounded-xl px-4 py-3 mb-4 text-white" autoCapitalize="none"
                                    keyboardType="default" value={username} onChangeText={setUsername}/>
                                </View>
                                <View>
                                    <Text className="text-left text-white font-thin mb-3">
                                        Password
                                    </Text>
                                    <TextInput className="border border-white rounded-xl px-4 py-3 mb-4 text-white" autoCapitalize="none"
                                    value={password} onChangeText={setPassword} secureTextEntry/>
                                </View>
                                <View>
                                    <Text className="text-left text-white font-thin mb-3">
                                        Confirm password
                                    </Text>
                                    <TextInput
                                        className={`border rounded-xl px-4 py-3 mb-2 text-white ${
                                            password2 && password !== password2 ? "border-red-500" : "border-white"
                                        }`}
                                        autoCapitalize="none"
                                        value={password2}
                                        onChangeText={setPassword2}
                                        secureTextEntry
                                    />
                                    <View style={{ height: 24 }}>
                                        {password2 && password !== password2 && (
                                            <Text className="text-red-500 text-sm">
                                                Passwords do not match!
                                            </Text>
                                        )}
                                        {password2 && password === password2 && (
                                            <Text className="text-green-500 text-sm">
                                                Passwords match!
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <TouchableOpacity className="bg-red-500 rounded-xl py-3 px-4 items-center mb-3" onPress={handleRegister}>
                                    <Text className="text-white font-bold text-base">Register</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
        </ImageBackground>
    )
}