import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  Share,
} from "react-native";
import { useFamily } from "../../hooks/useFamily";
import { useStore } from "../../store/useStore";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Colors } from "../../constants/colors";

export default function FamilyScreen() {
  const { familyId, familyMembers, fetchMembers, getInviteCode, createFamily } =
    useFamily();
  const profile = useStore((s) => s.profile);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (familyId) {
      fetchMembers();
      loadInviteCode();
    }
  }, [familyId]);

  async function loadInviteCode() {
    const code = await getInviteCode();
    setInviteCode(code);
  }

  async function handleCreateFamily() {
    setLoading(true);
    try {
      await createFamily(`${profile?.display_name}の家族`);
      await loadInviteCode();
    } catch (e: any) {
      Alert.alert("エラー", e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!inviteCode) return;
    await Share.share({
      message: `MimamoriBridgeで家族とつながりましょう！\n招待コード: ${inviteCode}\n\nアプリをダウンロードして、このコードを入力してください。`,
    });
  }

  if (!familyId) {
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
            fontSize: 20,
            fontWeight: "700",
            color: Colors.text,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          家族グループを作成しましょう
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: Colors.textSecondary,
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          招待コードを作成して、見守りたい方に共有してください
        </Text>
        <Button
          title="家族グループを作成"
          onPress={handleCreateFamily}
          loading={loading}
        />
      </View>
    );
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
            marginBottom: 8,
          }}
        >
          招待コード
        </Text>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "800",
            color: Colors.primary,
            textAlign: "center",
            letterSpacing: 6,
            marginBottom: 16,
          }}
        >
          {inviteCode || "------"}
        </Text>
        <Button title="招待コードを共有" onPress={handleShare} size="sm" />
      </Card>

      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: Colors.text,
          marginTop: 8,
        }}
      >
        メンバー
      </Text>

      {familyMembers.map((member) => (
        <Card key={member.id}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor:
                  member.role === "senior"
                    ? Colors.primaryLight
                    : "#E3F2FD",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20 }}>
                {member.role === "senior" ? "🏠" : "👀"}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: Colors.text,
                }}
              >
                {member.display_name}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: Colors.textSecondary,
                }}
              >
                {member.role === "senior" ? "見守られる側" : "見守る側"}
              </Text>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}
