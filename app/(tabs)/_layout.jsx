import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: "#000" },
      tabBarActiveTintColor: "#ef4444",
      tabBarInactiveTintColor: "#ffffff60",
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={24} />
        }}
      />
    </Tabs>
  );
}