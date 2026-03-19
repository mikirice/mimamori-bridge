import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useStore } from "../store/useStore";

interface CheckinRecord {
  id: string;
  type: string;
  responded_at: string | null;
  created_at: string;
}

export function useCheckins() {
  const { profile, familyId } = useStore();
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState<CheckinRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const checkToday = useCallback(async () => {
    if (!profile) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("check_ins")
      .select("id")
      .eq("senior_id", profile.id)
      .gte("created_at", `${today}T00:00:00`)
      .not("responded_at", "is", null)
      .limit(1);

    setTodayCheckedIn(!!(data && data.length > 0));
  }, [profile]);

  const doCheckin = useCallback(
    async (type: "morning" | "manual" | "tap_response" = "morning") => {
      if (!profile || !familyId) return;
      setLoading(true);

      const now = new Date().toISOString();
      const { error } = await supabase.from("check_ins").insert({
        senior_id: profile.id,
        family_id: familyId,
        type,
        responded_at: now,
      });

      if (!error) {
        setTodayCheckedIn(true);
      }
      setLoading(false);
      return !error;
    },
    [profile, familyId]
  );

  const fetchRecent = useCallback(
    async (seniorId?: string, limit: number = 7) => {
      const targetId = seniorId || profile?.id;
      if (!targetId) return;

      const { data } = await supabase
        .from("check_ins")
        .select("id, type, responded_at, created_at")
        .eq("senior_id", targetId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (data) {
        setRecentCheckins(data);
      }
    },
    [profile]
  );

  useEffect(() => {
    checkToday();
  }, [checkToday]);

  return {
    todayCheckedIn,
    recentCheckins,
    loading,
    doCheckin,
    checkToday,
    fetchRecent,
  };
}
