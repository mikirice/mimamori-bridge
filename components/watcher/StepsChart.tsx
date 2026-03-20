import { View, Text } from "react-native";
import { Card } from "../ui/Card";
import { Colors } from "../../constants/colors";

interface StepsChartProps {
  todaySteps: number | null;
  yesterdaySteps: number | null;
  seniorName: string;
}

export function StepsChart({
  todaySteps,
  yesterdaySteps,
  seniorName,
}: StepsChartProps) {
  const today = todaySteps ?? 0;
  const yesterday = yesterdaySteps ?? 0;
  const maxSteps = Math.max(today, yesterday, 1000);
  const todayPct = Math.min((today / maxSteps) * 100, 100);
  const yesterdayPct = Math.min((yesterday / maxSteps) * 100, 100);

  const diff = yesterday > 0 ? Math.round(((today - yesterday) / yesterday) * 100) : 0;
  const diffLabel =
    diff > 0
      ? `+${diff}%`
      : diff < 0
        ? `${diff}%`
        : "±0%";
  const diffColor =
    diff > 0 ? Colors.success : diff < 0 ? Colors.alert : Colors.textSecondary;

  return (
    <Card>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: Colors.text,
          }}
        >
          {seniorName}さんの歩数
        </Text>
        <Text style={{ fontSize: 14, fontWeight: "600", color: diffColor }}>
          昨日比 {diffLabel}
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {/* Today */}
        <View style={{ gap: 4 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
              今日
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.text }}>
              {today.toLocaleString()}
              <Text style={{ fontSize: 12, fontWeight: "400", color: Colors.textSecondary }}>
                {" "}歩
              </Text>
            </Text>
          </View>
          <View
            style={{
              height: 12,
              backgroundColor: Colors.border,
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${todayPct}%`,
                backgroundColor: Colors.primary,
                borderRadius: 6,
              }}
            />
          </View>
        </View>

        {/* Yesterday */}
        <View style={{ gap: 4 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
              昨日
            </Text>
            <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
              {yesterday.toLocaleString()} 歩
            </Text>
          </View>
          <View
            style={{
              height: 8,
              backgroundColor: Colors.border,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${yesterdayPct}%`,
                backgroundColor: Colors.textLight,
                borderRadius: 4,
              }}
            />
          </View>
        </View>
      </View>
    </Card>
  );
}
