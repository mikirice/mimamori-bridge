import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Colors } from "../../constants/colors";
import { useStore } from "../../store/useStore";

export default function SeniorSettings() {
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
            fontSize: 20,
            fontWeight: "700",
            color: Colors.text,
            marginBottom: 4,
          }}
        >
          {profile?.display_name}
        </Text>
        <Text style={{ fontSize: 16, color: Colors.textSecondary }}>
          {profile?.email}
        </Text>
      </Card>

      <Card>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: Colors.text,
            marginBottom: 12,
          }}
        >
          チェックイン通知
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: Colors.textSecondary,
            lineHeight: 26,
          }}
        >
          毎朝 7:00 に「元気ですか？」通知が届きます。{"\n"}
          ボタンをタップするだけで家族に安心を届けられます。
        </Text>
      </Card>

      <Card>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: Colors.text,
            marginBottom: 8,
          }}
        >
          プライバシー
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: Colors.textSecondary,
            lineHeight: 26,
          }}
        >
          このアプリはGPS追跡を行いません。{"\n"}
          共有されるのは歩数と安否確認の情報のみです。
        </Text>
      </Card>

      <Button
        title="ログアウト"
        onPress={handleSignOut}
        variant="danger"
        size="lg"
        style={{ marginTop: 16 }}
      />
    </ScrollView>
  );
}
