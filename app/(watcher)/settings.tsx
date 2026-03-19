import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Colors } from "../../constants/colors";
import { useStore } from "../../store/useStore";

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const profile = useStore((s) => s.profile);

  function handleSignOut() {
    Alert.alert("ログアウト", "ログアウトしますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "ログアウト",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      <Card>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: Colors.textSecondary,
            marginBottom: 4,
          }}
        >
          アカウント
        </Text>
        <Text
          style={{ fontSize: 18, fontWeight: "700", color: Colors.text }}
        >
          {profile?.display_name}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: Colors.textSecondary,
            marginTop: 2,
          }}
        >
          {profile?.email}
        </Text>
      </Card>

      <Card>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: Colors.textSecondary,
            marginBottom: 12,
          }}
        >
          通知設定
        </Text>
        <Text style={{ fontSize: 15, color: Colors.text, lineHeight: 24 }}>
          チェックイン未応答のアラートを受け取る時間や、歩数の閾値は今後のアップデートで設定できるようになります。
        </Text>
      </Card>

      <Card>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: Colors.textSecondary,
            marginBottom: 12,
          }}
        >
          アプリについて
        </Text>
        <Text style={{ fontSize: 15, color: Colors.text }}>
          MimamoriBridge v1.0.0
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: Colors.textSecondary,
            marginTop: 4,
          }}
        >
          離れていても、穏やかに見守る
        </Text>
      </Card>

      <Button
        title="ログアウト"
        onPress={handleSignOut}
        variant="danger"
        style={{ marginTop: 16 }}
      />
    </ScrollView>
  );
}
