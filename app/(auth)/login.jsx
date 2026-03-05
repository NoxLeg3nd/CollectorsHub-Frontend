import {View, Text, TextInput, TouchableOpacity, ImageBackground, ToastAndroid, KeyboardAvoidingView, Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useState, useEffect, useRef} from 'react';
import {StatusBar} from 'expo-status-bar';
import api from "../../src/services/api";
import { router } from "expo-router";
import { useUser } from "../../src/context/UserContext";


export default function Login({ navigation }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const { login } = useUser();
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

    async function handleLogin() {
        try {
            const response = await api.post("/api/v1/loginUser", {
            username: username,
            password: password,
            });
            login(response.data);
            ToastAndroid.show("Welcome to the app!", ToastAndroid.SHORT);
            router.replace("/(tabs)/home");
        } catch (error) {
            console.log("Error:", error);
            ToastAndroid.show("Username or password is wrong!", ToastAndroid.SHORT);
        }
    }

    return(
        <ImageBackground source={require("../../assets/login.jpg")} resizeMode="cover" className="flex-1" style={{ flex: 1 }}>
            <StatusBar style="light"/>
            <KeyboardAvoidingView className="flex-1" behavior="padding" keyboardVerticalOffset={0}>
                <SafeAreaView className="flex-1">
                    <View className="flex-1 px-6 justify-center items-center w-full">
                        <Animated.View 
                            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                            className="px-6 justify-center w-full bg-black rounded-xl border border-white"
                        >
                            <Text className="text-[35px] font-bold text-center text-red-500 flex-wrap pt-5">
                                Welcome to CollectorsHub!
                            </Text>
                            <Text className="text-center text-white m-5 font-bold text-[20px]">
                                Please sign in below!
                            </Text>
                            <View>
                                <Text className="text-left text-white font-thin mb-3">
                                    Username
                                </Text>
                                <TextInput className="border border-white rounded-xl px-4 py-3 mb-4 text-white" autoComplete="email" autoCapitalize="none"
                                keyboardType="email-address" value={username} onChangeText={setUsername}/>
                            </View>
                            <View>
                                <Text className="text-left text-white font-thin mb-3">
                                    Password
                                </Text>
                                <TextInput className="border border-white rounded-xl px-4 py-3 mb-4 text-white" autoComplete="password" autoCapitalize="none"
                                value={password} onChangeText={setPassword} secureTextEntry/>
                            </View>
                            <TouchableOpacity className="bg-red-500 rounded-xl py-3 px-4 items-center mb-3" onPress={handleLogin}>
                                <Text className="text-white font-bold text-base">Login</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="items-center mb-3" onPress={() => router.push("/(auth)/register")}>
                                <Text className="text-white font-thin text-base">Don't have an account?</Text>
                                <Text className="text-blue-500 font-bold text-base">Register one here!</Text> 
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </ImageBackground>
    )
}