// Supabase Edge Function: check-anomaly
// Run via cron every hour between 7:00-22:00
// Checks all seniors in all families for anomalies and creates alerts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STEPS_THRESHOLD = 100;

interface Senior {
  user_id: string;
  family_id: string;
  display_name: string;
}

Deno.serve(async (_req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const today = new Date().toISOString().split("T")[0];
  const currentHour = new Date().getHours();

  // Get all seniors
  const { data: seniors } = await supabase
    .from("family_members")
    .select("user_id, family_id, users(display_name)")
    .eq("role", "senior");

  if (!seniors || seniors.length === 0) {
    return new Response(JSON.stringify({ checked: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  let alertsCreated = 0;

  for (const senior of seniors as any[]) {
    const seniorId = senior.user_id;
    const familyId = senior.family_id;

    // Check 1: No check-in (after 9 AM)
    if (currentHour >= 9) {
      const { data: checkins } = await supabase
        .from("check_ins")
        .select("id")
        .eq("senior_id", seniorId)
        .gte("created_at", `${today}T00:00:00`)
        .not("responded_at", "is", null)
        .limit(1);

      if (!checkins || checkins.length === 0) {
        const created = await maybeCreateAlert(
          supabase,
          familyId,
          seniorId,
          "no_checkin",
          `${senior.users?.display_name}さんの今朝のチェックインがありません`,
          today
        );
        if (created) alertsCreated++;
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
      if (steps < STEPS_THRESHOLD) {
        const created = await maybeCreateAlert(
          supabase,
          familyId,
          seniorId,
          "low_steps",
          `${senior.users?.display_name}さんの今日の歩数が${steps}歩と少ないようです`,
          today
        );
        if (created) alertsCreated++;
      }
    }
  }

  return new Response(
    JSON.stringify({
      checked: seniors.length,
      alerts_created: alertsCreated,
      timestamp: new Date().toISOString(),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});

async function maybeCreateAlert(
  supabase: any,
  familyId: string,
  seniorId: string,
  alertType: string,
  message: string,
  today: string
): Promise<boolean> {
  // Don't duplicate alerts
  const { data: existing } = await supabase
    .from("alerts")
    .select("id")
    .eq("family_id", familyId)
    .eq("senior_id", seniorId)
    .eq("alert_type", alertType)
    .gte("created_at", `${today}T00:00:00`)
    .is("resolved_at", null)
    .limit(1);

  if (existing && existing.length > 0) return false;

  // Create alert
  await supabase.from("alerts").insert({
    family_id: familyId,
    senior_id: seniorId,
    alert_type: alertType,
    message,
  });

  // Send push notification to all watchers in this family
  const { data: watchers } = await supabase
    .from("family_members")
    .select("user_id")
    .eq("family_id", familyId)
    .eq("role", "watcher");

  if (watchers) {
    for (const watcher of watchers) {
      const { data: settings } = await supabase
        .from("notification_settings")
        .select("expo_push_token")
        .eq("user_id", watcher.user_id)
        .single();

      if (settings?.expo_push_token) {
        await sendPushNotification(
          settings.expo_push_token,
          "要確認",
          message
        );
      }
    }
  }

  return true;
}

async function sendPushNotification(
  token: string,
  title: string,
  body: string
) {
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: token,
        title,
        body,
        sound: "default",
        data: { type: "alert" },
      }),
    });
  } catch {
    // Silently fail - push is best effort
  }
}
