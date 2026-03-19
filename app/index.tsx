import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../store/useStore";
import { Colors } from "../constants/colors";

export default function Index() {
  const router = useRouter();
  const { session, profile, isLoading, familyId } = useStore();

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      router.replace("/(auth)/login");
      return;
    }

    if (!profile) {
      router.replace("/(auth)/login");
      return;
    }

    if (!familyId) {
      if (profile.role === "watcher") {
        router.replace("/(watcher)/family");
      } else {
        router.replace("/(auth)/join");
      }
      return;
    }

    if (profile.role === "watcher") {
      router.replace("/(watcher)");
    } else {
      router.replace("/(senior)");
    }
  }, [isLoading, session, profile, familyId]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "700",
          color: Colors.primary,
          marginBottom: 16,
        }}
      >
        MimamoriBridge
      </Text>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
