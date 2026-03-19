import { View, Text, TouchableOpacity } from "react-native";
import { Card } from "../ui/Card";
import { StatusBadge } from "../ui/StatusBadge";
import { Colors } from "../../constants/colors";

type Status = "ok" | "warning" | "alert" | "unknown";

interface SeniorCardProps {
  name: string;
  lastCheckin: string | null;
  todaySteps: number | null;
  status: Status;
  onPress?: () => void;
  onNudge?: () => void;
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "未確認";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}時間前`;
  return `${Math.floor(diffHours / 24)}日前`;
}

export function SeniorCard({
  name,
  lastCheckin,
  todaySteps,
  status,
  onPress,
  onNudge,
}: SeniorCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: Colors.primaryLight,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 24 }}>🏠</Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: Colors.text,
                }}
              >
                {name}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: Colors.textSecondary,
                  marginTop: 2,
                }}
              >
                最終確認: {formatTimeAgo(lastCheckin)}
              </Text>
            </View>
          </View>
          <StatusBadge status={status} />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
            <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
              今日の歩数:
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: Colors.text,
              }}
            >
              {todaySteps !== null ? todaySteps.toLocaleString() : "---"}
            </Text>
            <Text style={{ fontSize: 14, color: Colors.textSecondary }}>歩</Text>
          </View>

          {onNudge && (
            <TouchableOpacity
              onPress={onNudge}
              style={{
                backgroundColor: Colors.primaryLight,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  color: Colors.primaryDark,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                元気？
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
