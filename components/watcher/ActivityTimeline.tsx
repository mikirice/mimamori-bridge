import { View, Text } from "react-native";
import { Card } from "../ui/Card";
import { Colors } from "../../constants/colors";

interface TimelineEvent {
  id: string;
  type: "checkin" | "steps" | "alert" | "location";
  message: string;
  time: string;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
  title?: string;
}

const typeIcons: Record<string, string> = {
  checkin: "✅",
  steps: "🚶",
  alert: "⚠️",
  location: "📍",
};

const typeColors: Record<string, string> = {
  checkin: Colors.success,
  steps: Colors.primary,
  alert: Colors.warning,
  location: "#2196F3",
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivityTimeline({
  events,
  title = "今日のアクティビティ",
}: ActivityTimelineProps) {
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
        {title}
      </Text>

      {events.length === 0 ? (
        <Text
          style={{
            fontSize: 14,
            color: Colors.textSecondary,
            textAlign: "center",
            paddingVertical: 12,
          }}
        >
          まだアクティビティがありません
        </Text>
      ) : (
        <View style={{ gap: 0 }}>
          {events.map((event, index) => (
            <View
              key={event.id}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <View style={{ alignItems: "center", width: 24 }}>
                <Text style={{ fontSize: 16 }}>{typeIcons[event.type]}</Text>
                {index < events.length - 1 && (
                  <View
                    style={{
                      width: 2,
                      height: 24,
                      backgroundColor: Colors.border,
                      marginVertical: 4,
                    }}
                  />
                )}
              </View>
              <View style={{ flex: 1, paddingBottom: index < events.length - 1 ? 8 : 0 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: Colors.text,
                    fontWeight: "500",
                  }}
                >
                  {event.message}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  {formatTime(event.time)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}
