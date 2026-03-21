import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

function TabIcon({ name, focused }: { name: React.ComponentProps<typeof Ionicons>["name"]; focused: boolean }) {
  return (
    <Ionicons name={name} size={24} color={focused ? Colors.primary : Colors.textSecondary} />
  );
}

export default function WatcherLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTitleStyle: {
          fontWeight: "700",
          color: Colors.text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ホーム",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "home" : "home-outline"} focused={focused} />
          ),
          headerTitle: "MimamoriBridge",
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: "家族",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "people" : "people-outline"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "設定",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "settings" : "settings-outline"} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
