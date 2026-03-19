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

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"watcher" | "senior" | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!displayName || !email || !password || !role) {
      Alert.alert("入力エラー", "すべての項目を入力してください");
      return;
    }

    if (password.length < 6) {
      Alert.alert("入力エラー", "パスワードは6文字以上で入力してください");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, displayName, role);
      Alert.alert("登録完了", "アカウントが作成されました");
    } catch (e: any) {
      Alert.alert("登録エラー", e.message);
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
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: Colors.text,
            marginBottom: 8,
          }}
        >
          新規登録
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: Colors.textSecondary,
            marginBottom: 32,
          }}
        >
          あなたの役割を選んでください
        </Text>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => setRole("watcher")}
            style={{
              flex: 1,
              padding: 20,
              borderRadius: 16,
              borderWidth: 2,
              borderColor:
                role === "watcher" ? Colors.primary : Colors.border,
              backgroundColor:
                role === "watcher" ? Colors.primaryLight : Colors.surface,
              alignItems: "center",
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 32 }}>👀</Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color:
                  role === "watcher" ? Colors.primaryDark : Colors.text,
              }}
            >
              見守る側
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: Colors.textSecondary,
                textAlign: "center",
              }}
            >
              お子さん・ご家族
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setRole("senior")}
            style={{
              flex: 1,
              padding: 20,
              borderRadius: 16,
              borderWidth: 2,
              borderColor:
                role === "senior" ? Colors.primary : Colors.border,
              backgroundColor:
                role === "senior" ? Colors.primaryLight : Colors.surface,
              alignItems: "center",
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 32 }}>🏠</Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color:
                  role === "senior" ? Colors.primaryDark : Colors.text,
              }}
            >
              見守られる側
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: Colors.textSecondary,
                textAlign: "center",
              }}
            >
              お父さん・お母さん
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 16 }}>
          <Input
            label="お名前"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="表示名"
            autoCapitalize="words"
          />

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
            placeholder="6文字以上"
            secureTextEntry
          />

          <Button
            title="アカウント作成"
            onPress={handleRegister}
            loading={loading}
            disabled={!role}
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
            既にアカウントをお持ちの方は
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: Colors.primary, fontWeight: "600" }}>
              ログイン
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
