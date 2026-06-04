import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UserProvider } from "../src/context/UserContext";
import "../global.css";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <UserProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(profile)" />
                    <Stack.Screen name="(product)" />
                    <Stack.Screen name="(listings)" />
                    <Stack.Screen name="(reviews)" />
                    <Stack.Screen name="(admin)" />
                </Stack>
            </UserProvider>
        </SafeAreaProvider>
    );
}