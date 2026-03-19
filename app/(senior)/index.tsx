import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useStore } from "../../store/useStore";
import { CheckInButton } from "../../components/senior/CheckInButton";
import { Colors } from "../../constants/colors";

export default function SeniorHome() {
  const router = useRouter();
  const { profile, familyId } = useStore();
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkTodayCheckin();
  }, []);

  async function checkTodayCheckin() {
    if (!profile) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("check_ins")
      .select("id")
      .eq("senior_id", profile.id)
      .gte("created_at", `${today}T00:00:00`)
      .not("responded_at", "is", null)
      .limit(1);

    if (data && data.length > 0) {
      setCheckedIn(true);
    }
  }

  async function handleCheckIn() {
    if (!profile || !familyId) return;
    setLoading(true);

    try {
      const now = new Date().toISOString();
      await supabase.from("check_ins").insert({
        senior_id: profile.id,
        family_id: familyId,
        type: "morning",
        responded_at: now,
      });

      setCheckedIn(true);
      Alert.alert("送信しました", "ご家族に「元気です」を伝えました");
    } catch (e: any) {
      Alert.alert("エラー", "送信に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
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
        checkedIn={checkedIn}
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
        {checkedIn
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
