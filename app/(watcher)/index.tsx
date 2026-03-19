import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useStore } from "../../store/useStore";
import { useFamily } from "../../hooks/useFamily";
import { supabase } from "../../lib/supabase";
import { SeniorCard } from "../../components/watcher/SeniorCard";
import { Card } from "../../components/ui/Card";
import { Colors } from "../../constants/colors";

type Status = "ok" | "warning" | "alert" | "unknown";

interface SeniorStatus {
  userId: string;
  displayName: string;
  lastCheckin: string | null;
  todaySteps: number | null;
  status: Status;
}

export default function WatcherHome() {
  const { profile, familyId } = useStore();
  const { fetchMembers, familyMembers } = useFamily();
  const [seniors, setSeniors] = useState<SeniorStatus[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!familyId) return;

    await fetchMembers();

    const seniorMembers = familyMembers.filter((m) => m.role === "senior");

    const statuses: SeniorStatus[] = [];
    for (const member of seniorMembers) {
      const { data: lastCheckin } = await supabase
        .from("check_ins")
        .select("responded_at")
        .eq("senior_id", member.user_id)
        .not("responded_at", "is", null)
        .order("responded_at", { ascending: false })
        .limit(1)
        .single();

      const today = new Date().toISOString().split("T")[0];
      const { data: stepsData } = await supabase
        .from("health_signals")
        .select("value")
        .eq("senior_id", member.user_id)
        .eq("signal_type", "steps")
        .gte("recorded_at", `${today}T00:00:00`)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .single();

      const steps = stepsData?.value?.steps ?? null;
      const lastTime = lastCheckin?.responded_at ?? null;

      let status: Status = "unknown";
      if (lastTime) {
        const hoursSince =
          (Date.now() - new Date(lastTime).getTime()) / 3600000;
        if (hoursSince < 4) status = "ok";
        else if (hoursSince < 8) status = "warning";
        else status = "alert";
      }

      statuses.push({
        userId: member.user_id,
        displayName: member.display_name,
        lastCheckin: lastTime,
        todaySteps: steps,
        status,
      });
    }

    setSeniors(statuses);
  }, [familyId, familyMembers]);

  useEffect(() => {
    loadData();
  }, [familyId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  async function handleNudge(seniorId: string, name: string) {
    Alert.alert(
      "安否確認",
      `${name}さんに「元気？」を送りますか？`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "送る",
          onPress: async () => {
            await supabase.from("check_ins").insert({
              senior_id: seniorId,
              family_id: familyId,
              type: "manual",
            });
            Alert.alert("送信完了", `${name}さんに通知を送りました`);
          },
        },
      ]
    );
  }

  const greeting = getGreeting();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ padding: 20, gap: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "700",
          color: Colors.text,
        }}
      >
        {greeting}、{profile?.display_name}さん
      </Text>

      {seniors.length === 0 ? (
        <Card>
          <Text
            style={{
              fontSize: 16,
              color: Colors.textSecondary,
              textAlign: "center",
              paddingVertical: 20,
            }}
          >
            見守り対象の方がまだいません。{"\n"}
            家族タブから招待コードを共有してください。
          </Text>
        </Card>
      ) : (
        seniors.map((senior) => (
          <SeniorCard
            key={senior.userId}
            name={senior.displayName}
            lastCheckin={senior.lastCheckin}
            todaySteps={senior.todaySteps}
            status={senior.status}
            onNudge={() => handleNudge(senior.userId, senior.displayName)}
          />
        ))
      )}
    </ScrollView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 10) return "おはようございます";
  if (hour < 17) return "こんにちは";
  return "こんばんは";
}
