import { TouchableOpacity, Text, View, Animated } from "react-native";
import { useRef, useEffect } from "react";
import { Colors } from "../../constants/colors";

interface CheckInButtonProps {
  onPress: () => void;
  disabled?: boolean;
  checkedIn?: boolean;
}

export function CheckInButton({
  onPress,
  disabled = false,
  checkedIn = false,
}: CheckInButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!checkedIn) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      scaleAnim.setValue(1);
    }
  }, [checkedIn]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        style={{
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: checkedIn ? Colors.primaryLight : Colors.primary,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 4 }}>
          {checkedIn ? "✓" : "☀️"}
        </Text>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: checkedIn ? Colors.primaryDark : "#FFFFFF",
          }}
        >
          {checkedIn ? "送信済み" : "元気です"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
