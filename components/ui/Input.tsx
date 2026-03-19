import { TextInput, Text, View, type ViewStyle } from "react-native";
import { Colors } from "../../constants/colors";

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric";
  error?: string;
  style?: ViewStyle;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = "none",
  keyboardType = "default",
  error,
  style,
  fontSize = 16,
  textAlign = "left",
}: InputProps) {
  return (
    <View style={[{ gap: 6 }, style]}>
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: Colors.text,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        textAlign={textAlign}
        style={{
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: error ? Colors.alert : Colors.border,
          borderRadius: 12,
          padding: 14,
          fontSize,
          color: Colors.text,
        }}
      />
      {error && (
        <Text style={{ fontSize: 13, color: Colors.alert }}>{error}</Text>
      )}
    </View>
  );
}
