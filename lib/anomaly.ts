import { supabase } from "./supabase";
import { Config } from "../constants/config";

interface AnomalyCheckResult {
  hasAnomaly: boolean;
  type: "no_checkin" | "low_steps" | "no_activity" | null;
  message: string | null;
}

export async function checkAnomalies(
  seniorId: string,
  familyId: string
): Promise<AnomalyCheckResult> {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();

  // Check 1: No check-in today after alert delay
  const currentHour = now.getHours();
  if (currentHour >= 9) {
    const { data: checkins } = await supabase
      .from("check_ins")
      .select("id")
      .eq("senior_id", seniorId)
      .gte("created_at", `${today}T00:00:00`)
      .not("responded_at", "is", null)
      .limit(1);

    if (!checkins || checkins.length === 0) {
      return {
        hasAnomaly: true,
        type: "no_checkin",
        message: "今朝のチェックインがありません",
      };
    }
  }

  // Check 2: Low steps (after noon)
  if (currentHour >= 12) {
    const { data: stepsData } = await supabase
      .from("health_signals")
      .select("value")
      .eq("senior_id", seniorId)
      .eq("signal_type", "steps")
      .gte("recorded_at", `${today}T00:00:00`)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .single();

    const steps = stepsData?.value?.steps ?? 0;
    if (steps < Config.stepsThreshold) {
      return {
        hasAnomaly: true,
        type: "low_steps",
        message: `今日の歩数が${steps}歩と少ないようです`,
      };
    }
  }

  // Check 3: No activity signals at all today (after 10 AM)
  if (currentHour >= 10) {
    const { data: signals } = await supabase
      .from("health_signals")
      .select("id")
      .eq("senior_id", seniorId)
      .gte("recorded_at", `${today}T00:00:00`)
      .limit(1);

    const { data: checkins } = await supabase
      .from("check_ins")
      .select("id")
      .eq("senior_id", seniorId)
      .gte("created_at", `${today}T00:00:00`)
      .limit(1);

    if (
      (!signals || signals.length === 0) &&
      (!checkins || checkins.length === 0)
    ) {
      return {
        hasAnomaly: true,
        type: "no_activity",
        message: "今日はまだ活動が検知されていません",
      };
    }
  }

  return { hasAnomaly: false, type: null, message: null };
}

export async function createAlert(
  familyId: string,
  seniorId: string,
  alertType: string,
  message: string
): Promise<void> {
  // Check if same type alert already exists today (not resolved)
  const today = new Date().toISOString().split("T")[0];
  const { data: existing } = await supabase
    .from("alerts")
    .select("id")
    .eq("family_id", familyId)
    .eq("senior_id", seniorId)
    .eq("alert_type", alertType)
    .gte("created_at", `${today}T00:00:00`)
    .is("resolved_at", null)
    .limit(1);

  if (existing && existing.length > 0) return;

  await supabase.from("alerts").insert({
    family_id: familyId,
    senior_id: seniorId,
    alert_type: alertType,
    message,
  });
}
