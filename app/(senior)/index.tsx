import { useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../../store/useStore";
import { useCheckins } from "../../hooks/useCheckins";
import { useNotifications } from "../../hooks/useNotifications";
import { useHealthKit } from "../../hooks/useHealthKit";
import { CheckInButton } from "../../components/senior/CheckInButton";
import { Colors } from "../../constants/colors";

export default function SeniorHome() {
  const router = useRouter();
  const { profile, familyId } = useStore();
  const { todayCheckedIn, loading, doCheckin } = useCheckins();
  const { scheduleDailyCheckin } = useNotifications();
  const { isAvailable, startBackgroundSync } = useHealthKit();

  useEffect(() => {
    if (!familyId) {
      router.replace("/(auth)/join");
      return;
    }
    scheduleDailyCheckin(7, 0);
    if (isAvailable) {
      startBackgroundSync();
    }
  }, [isAvailable, familyId]);

  async function handleCheckIn() {
    const success = await doCheckin("morning");
    if (success) {
      Alert.alert("送信しました", "ご家族に「元気です」を伝えました");
    } else {
      Alert.alert("エラー", "送信に失敗しました。もう一度お試しください。");
    }
  }

  const greeting = getGreeting();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 48 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: Colors.text,
            marginBottom: 8,
          }}
        >
          {greeting}
        </Text>
        <Text
          style={{
            fontSize: 20,
            color: Colors.textSecondary,
          }}
        >
          {profile?.display_name}さん
        </Text>
      </View>

      <CheckInButton
        onPress={handleCheckIn}
        disabled={loading}
        checkedIn={todayCheckedIn}
      />

      <Text
        style={{
          fontSize: 16,
          color: Colors.textSecondary,
          marginTop: 32,
          textAlign: "center",
          lineHeight: 26,
        }}
      >
        {todayCheckedIn
          ? "今日の安否確認は完了しています"
          : "ボタンをタップして\n家族に元気を伝えましょう"}
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/(senior)/settings")}
        style={{ position: "absolute", top: 60, right: 24 }}
      >
        <Text style={{ fontSize: 28 }}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 10) return "おはようございます";
  if (hour < 17) return "こんにちは";
  return "こんばんは";
}
