import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useFamily } from "../../hooks/useFamily";
import { useStore } from "../../store/useStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Colors } from "../../constants/colors";

export default function JoinScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const { joinFamily, createFamily } = useFamily();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    if (!inviteCode || inviteCode.length < 6) {
      Alert.alert("入力エラー", "6桁の招待コードを入力してください");
      return;
    }

    setLoading(true);
    try {
      await joinFamily(inviteCode);
      if (profile?.role === "watcher") {
        router.replace("/(watcher)");
      } else {
        router.replace("/(senior)");
      }
    } catch (e: any) {
      Alert.alert("エラー", e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateFamily() {
    setLoading(true);
    try {
      await createFamily(`${profile?.display_name}の家族`);
      if (profile?.role === "watcher") {
        router.replace("/(watcher)");
      } else {
        router.replace("/(senior)");
      }
    } catch (e: any) {
      Alert.alert("エラー", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: Colors.background,
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
        家族とつながる
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: Colors.textSecondary,
          marginBottom: 32,
        }}
      >
        招待コードを入力するか、新しい家族グループを作成してください
      </Text>

      <View style={{ gap: 16, marginBottom: 32 }}>
        <Input
          label="招待コード"
          value={inviteCode}
          onChangeText={(text) => setInviteCode(text.toUpperCase())}
          placeholder="6桁のコード"
          autoCapitalize="characters"
          fontSize={24}
          textAlign="center"
        />

        <Button
          title="家族に参加"
          onPress={handleJoin}
          loading={loading}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          marginBottom: 32,
        }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
        <Text style={{ color: Colors.textSecondary }}>または</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
      </View>

      <Button
        title="新しい家族グループを作成"
        onPress={handleCreateFamily}
        variant="outline"
        loading={loading}
      />
    </View>
  );
}
