import { View, Text } from "react-native";
import { Card } from "../ui/Card";
import { Colors } from "../../constants/colors";

interface CheckinDay {
  date: string;
  checkedIn: boolean;
  respondedAt?: string;
}

interface CheckinHistoryProps {
  days: CheckinDay[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getMonth() + 1}/${date.getDate()}(${days[date.getDay()]})`;
}

function formatTime(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CheckinHistory({ days }: CheckinHistoryProps) {
  return (
    <Card>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: Colors.text,
          marginBottom: 16,
        }}
      >
        チェックイン履歴（直近7日）
      </Text>

      <View style={{ gap: 8 }}>
        {days.map((day) => (
          <View
            key={day.date}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: Colors.text,
                fontWeight: "500",
              }}
            >
              {formatDate(day.date)}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {day.respondedAt && (
                <Text
                  style={{
                    fontSize: 13,
                    color: Colors.textSecondary,
                  }}
                >
                  {formatTime(day.respondedAt)}
                </Text>
              )}
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: day.checkedIn
                    ? Colors.successLight
                    : Colors.alertLight,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 12 }}>
                  {day.checkedIn ? "✓" : "−"}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
