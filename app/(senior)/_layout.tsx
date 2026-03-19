import { Stack } from "expo-router";
import { Colors } from "../../constants/colors";

export default function SeniorLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTitleStyle: { fontWeight: "700", color: Colors.text },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "MimamoriBridge", headerShown: false }}
      />
      <Stack.Screen name="settings" options={{ title: "設定" }} />
    </Stack>
  );
}
