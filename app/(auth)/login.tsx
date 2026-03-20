import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Colors } from "../../constants/colors";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("入力エラー", "メールアドレスとパスワードを入力してください");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // Auth state change will trigger profile fetch in useAuth
      // Navigate to index which handles routing based on profile/role
      router.replace("/");
    } catch (e: any) {
      Alert.alert("ログインエラー", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          <Text
            style={{
              fontSize: 36,
              fontWeight: "800",
              color: Colors.primary,
              marginBottom: 8,
            }}
          >
            MimamoriBridge
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: Colors.textSecondary,
              textAlign: "center",
            }}
          >
            離れていても、穏やかに見守る
          </Text>
        </View>

        <View style={{ gap: 16 }}>
          <Input
            label="メールアドレス"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
          />

          <Input
            label="パスワード"
            value={password}
            onChangeText={setPassword}
            placeholder="パスワード"
            secureTextEntry
          />

          <Button
            title="ログイン"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 8 }}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 24,
            gap: 4,
          }}
        >
          <Text style={{ color: Colors.textSecondary }}>
            アカウントをお持ちでない方は
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={{ color: Colors.primary, fontWeight: "600" }}>
              新規登録
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
