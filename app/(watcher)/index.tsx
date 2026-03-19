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
import { useNotifications } from "../../hooks/useNotifications";
import { useRealtimeCheckins, useRealtimeAlerts } from "../../hooks/useRealtime";
import { supabase } from "../../lib/supabase";
import { SeniorCard } from "../../components/watcher/SeniorCard";
import { AlertBanner } from "../../components/watcher/AlertBanner";
import { ActivityTimeline } from "../../components/watcher/ActivityTimeline";
import { CheckinHistory } from "../../components/watcher/CheckinHistory";
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

interface ActiveAlert {
  id: string;
  seniorName: string;
  message: string;
}

interface TimelineEvent {
  id: string;
  type: "checkin" | "steps" | "alert" | "location";
  message: string;
  time: string;
}

interface CheckinDay {
  date: string;
  checkedIn: boolean;
  respondedAt?: string;
}

export default function WatcherHome() {
  const { profile, familyId } = useStore();
  const { fetchMembers, familyMembers } = useFamily();
  useNotifications();

  const [seniors, setSeniors] = useState<SeniorStatus[]>([]);
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [checkinDays, setCheckinDays] = useState<CheckinDay[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSenior, setSelectedSenior] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!familyId) return;
    await fetchMembers();
  }, [familyId]);

  // Separate effect for processing members once they're loaded
  useEffect(() => {
    if (!familyId || familyMembers.length === 0) return;
    loadSeniorStatuses();
    loadAlerts();
  }, [familyId, familyMembers]);

  async function loadSeniorStatuses() {
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

    // Load details for first senior
    if (statuses.length > 0) {
      const first = statuses[0].userId;
      setSelectedSenior(first);
      loadTimeline(first);
      loadCheckinHistory(first);
    }
  }

  async function loadAlerts() {
    if (!familyId) return;

    const { data } = await supabase
      .from("alerts")
      .select("id, senior_id, alert_type, message, created_at")
      .eq("family_id", familyId)
      .is("resolved_at", null)
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) {
      const mapped = data.map((a: any) => {
        const senior = familyMembers.find((m) => m.user_id === a.senior_id);
        return {
          id: a.id,
          seniorName: senior?.display_name || "不明",
          message: a.message || getAlertMessage(a.alert_type),
        };
      });
      setAlerts(mapped);
    }
  }

  async function loadTimeline(seniorId: string) {
    const today = new Date().toISOString().split("T")[0];

    const [checkinsRes, signalsRes] = await Promise.all([
      supabase
        .from("check_ins")
        .select("id, type, responded_at, created_at")
        .eq("senior_id", seniorId)
        .gte("created_at", `${today}T00:00:00`)
        .order("created_at", { ascending: false }),
      supabase
        .from("health_signals")
        .select("id, signal_type, value, recorded_at")
        .eq("senior_id", seniorId)
        .gte("recorded_at", `${today}T00:00:00`)
        .order("recorded_at", { ascending: false })
        .limit(20),
    ]);

    const events: TimelineEvent[] = [];

    if (checkinsRes.data) {
      for (const c of checkinsRes.data) {
        events.push({
          id: c.id,
          type: "checkin",
          message: c.responded_at
            ? "チェックイン完了"
            : `チェックイン通知送信（${c.type === "manual" ? "手動" : "定時"}）`,
          time: c.responded_at || c.created_at,
        });
      }
    }

    if (signalsRes.data) {
      for (const s of signalsRes.data) {
        if (s.signal_type === "steps") {
          events.push({
            id: s.id,
            type: "steps",
            message: `歩数更新: ${s.value.steps?.toLocaleString()}歩`,
            time: s.recorded_at,
          });
        } else if (s.signal_type === "location_change") {
          events.push({
            id: s.id,
            type: "location",
            message: `${s.value.event === "departed" ? "外出" : "帰宅"}を検知`,
            time: s.recorded_at,
          });
        }
      }
    }

    events.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    setTimeline(events);
  }

  async function loadCheckinHistory(seniorId: string) {
    const days: CheckinDay[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const { data } = await supabase
        .from("check_ins")
        .select("responded_at")
        .eq("senior_id", seniorId)
        .gte("created_at", `${dateStr}T00:00:00`)
        .lt("created_at", `${dateStr}T23:59:59`)
        .not("responded_at", "is", null)
        .order("responded_at", { ascending: true })
        .limit(1);

      days.push({
        date: dateStr,
        checkedIn: !!(data && data.length > 0),
        respondedAt: data?.[0]?.responded_at ?? undefined,
      });
    }

    setCheckinDays(days);
  }

  // Realtime subscriptions
  useRealtimeCheckins(
    useCallback(
      (newCheckin: any) => {
        loadData();
      },
      [loadData]
    )
  );

  useRealtimeAlerts(
    useCallback(
      (newAlert: any) => {
        loadAlerts();
      },
      [familyId, familyMembers]
    )
  );

  useEffect(() => {
    loadData();
  }, [familyId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  async function handleNudge(seniorId: string, name: string) {
    Alert.alert("安否確認", `${name}さんに「元気？」を送りますか？`, [
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
    ]);
  }

  async function dismissAlert(alertId: string) {
    await supabase
      .from("alerts")
      .update({ resolved_at: new Date().toISOString() })
      .eq("id", alertId);

    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }

  const greeting = getGreeting();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
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

      {/* Active Alerts */}
      {alerts.map((alert) => (
        <AlertBanner
          key={alert.id}
          seniorName={alert.seniorName}
          message={alert.message}
          onDismiss={() => dismissAlert(alert.id)}
        />
      ))}

      {/* Senior Cards */}
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
            onPress={() => {
              setSelectedSenior(senior.userId);
              loadTimeline(senior.userId);
              loadCheckinHistory(senior.userId);
            }}
            onNudge={() => handleNudge(senior.userId, senior.displayName)}
          />
        ))
      )}

      {/* Activity Timeline */}
      {selectedSenior && <ActivityTimeline events={timeline} />}

      {/* Checkin History */}
      {selectedSenior && checkinDays.length > 0 && (
        <CheckinHistory days={checkinDays} />
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

function getAlertMessage(type: string): string {
  switch (type) {
    case "no_checkin":
      return "今朝のチェックインがありません";
    case "low_steps":
      return "今日の歩数が少ないようです";
    case "no_activity":
      return "しばらく活動が検知されていません";
    default:
      return "確認が必要です";
  }
}
