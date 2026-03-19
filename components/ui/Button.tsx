import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type ViewStyle,
} from "react-native";
import { Colors } from "../../constants/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const bgColors = {
    primary: Colors.primary,
    secondary: Colors.background,
    outline: "transparent",
    danger: Colors.alert,
  };

  const textColors = {
    primary: "#FFFFFF",
    secondary: Colors.text,
    outline: Colors.primary,
    danger: "#FFFFFF",
  };

  const sizes = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
    md: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 },
    lg: { paddingVertical: 16, paddingHorizontal: 32, fontSize: 18 },
    xl: { paddingVertical: 24, paddingHorizontal: 48, fontSize: 24 },
  };

  const s = sizes[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: bgColors[variant],
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
          borderWidth: variant === "outline" ? 2 : 0,
          borderColor: Colors.primary,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} />
      ) : (
        <Text
          style={{
            color: textColors[variant],
            fontSize: s.fontSize,
            fontWeight: "700",
          }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
