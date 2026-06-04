import { Redirect } from "expo-router";
import { useUser } from "../src/context/UserContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { user, loading } = useUser();

  if (loading) {
    return (
        <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#ef4444" size="large" />
        </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}