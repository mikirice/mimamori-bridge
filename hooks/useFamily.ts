import { useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useStore } from "../store/useStore";
import { Config } from "../constants/config";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < Config.inviteCodeLength; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function useFamily() {
  const { profile, familyId, familyMembers, setFamilyId, setFamilyMembers } =
    useStore();

  const createFamily = useCallback(
    async (name: string) => {
      if (!profile) throw new Error("Not logged in");

      const inviteCode = generateInviteCode();

      const { data: family, error } = await supabase
        .from("families")
        .insert({
          name,
          invite_code: inviteCode,
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      const { error: memberError } = await supabase
        .from("family_members")
        .insert({
          family_id: family.id,
          user_id: profile.id,
          role: profile.role,
        });

      if (memberError) throw memberError;

      setFamilyId(family.id);
      return family;
    },
    [profile]
  );

  const joinFamily = useCallback(
    async (inviteCode: string) => {
      if (!profile) throw new Error("Not logged in");

      const { data: family, error } = await supabase
        .from("families")
        .select("id")
        .eq("invite_code", inviteCode.toUpperCase())
        .single();

      if (error || !family) throw new Error("招待コードが見つかりません");

      const { error: memberError } = await supabase
        .from("family_members")
        .insert({
          family_id: family.id,
          user_id: profile.id,
          role: profile.role,
        });

      if (memberError) {
        if (memberError.code === "23505") {
          throw new Error("既にこの家族に参加しています");
        }
        throw memberError;
      }

      setFamilyId(family.id);
      return family;
    },
    [profile]
  );

  const fetchMembers = useCallback(async () => {
    if (!familyId) return [];

    // Fetch members and their display names separately to avoid RLS join issues
    const { data: memberData, error: memberError } = await supabase
      .from("family_members")
      .select("id, user_id, role")
      .eq("family_id", familyId);

    if (!memberData || memberError) return [];

    // Fetch display names for all member user_ids
    const userIds = memberData.map((m: any) => m.user_id);
    const { data: userData } = await supabase
      .from("users")
      .select("id, display_name")
      .in("id", userIds);

    const nameMap = new Map<string, string>();
    if (userData) {
      for (const u of userData) {
        nameMap.set(u.id, u.display_name);
      }
    }

    const members = memberData.map((m: any) => ({
      id: m.id,
      user_id: m.user_id,
      display_name: nameMap.get(m.user_id) || "Unknown",
      role: m.role,
    }));
    setFamilyMembers(members);
    return members;
  }, [familyId]);

  const getInviteCode = useCallback(async () => {
    if (!familyId) return null;

    const { data } = await supabase
      .from("families")
      .select("invite_code")
      .eq("id", familyId)
      .single();

    return data?.invite_code || null;
  }, [familyId]);

  return {
    familyId,
    familyMembers,
    createFamily,
    joinFamily,
    fetchMembers,
    getInviteCode,
  };
}
