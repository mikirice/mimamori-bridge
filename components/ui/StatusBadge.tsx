import { View, Text } from "react-native";
import { Colors } from "../../constants/colors";

type Status = "ok" | "warning" | "alert" | "unknown";

interface StatusBadgeProps {
  status: Status;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  ok: { bg: Colors.successLight, color: Colors.success, defaultLabel: "元気" },
  warning: {
    bg: Colors.warningLight,
    color: Colors.warning,
    defaultLabel: "注意",
  },
  alert: { bg: Colors.alertLight, color: Colors.alert, defaultLabel: "要確認" },
  unknown: {
    bg: "#F5F5F5",
    color: Colors.textSecondary,
    defaultLabel: "未確認",
  },
};

const sizes = {
  sm: { dotSize: 8, fontSize: 12, padding: 6 },
  md: { dotSize: 10, fontSize: 14, padding: 8 },
  lg: { dotSize: 12, fontSize: 16, padding: 10 },
};

export function StatusBadge({
  status,
  label,
  size = "md",
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const s = sizes[size];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: config.bg,
        paddingVertical: s.padding,
        paddingHorizontal: s.padding * 1.5,
        borderRadius: 20,
        gap: 6,
      }}
    >
      <View
        style={{
          width: s.dotSize,
          height: s.dotSize,
          borderRadius: s.dotSize / 2,
          backgroundColor: config.color,
        }}
      />
      <Text
        style={{
          color: config.color,
          fontSize: s.fontSize,
          fontWeight: "600",
        }}
      >
        {label || config.defaultLabel}
      </Text>
    </View>
  );
}
