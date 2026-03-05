import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UserProvider } from "../src/context/UserContext";
import "../global.css";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <UserProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                </Stack>
            </UserProvider>
        </SafeAreaProvider>
    );
}