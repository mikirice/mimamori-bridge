import { View, Text, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/colors";

interface AlertBannerProps {
  message: string;
  seniorName: string;
  onPress?: () => void;
  onDismiss?: () => void;
}

export function AlertBanner({
  message,
  seniorName,
  onPress,
  onDismiss,
}: AlertBannerProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: Colors.alertLight,
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: Colors.alert,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 16 }}>⚠️</Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: Colors.alert,
              }}
            >
              {seniorName}さん
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: Colors.text,
              lineHeight: 20,
            }}
          >
            {message}
          </Text>
        </View>
        {onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={{
                fontSize: 18,
                color: Colors.textSecondary,
              }}
            >
              ×
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
