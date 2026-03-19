export const Config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  defaultCheckinTime: "07:00",
  reminderDelayMinutes: 60,
  alertDelayMinutes: 120,
  stepsThreshold: 100,
  inviteCodeLength: 6,
} as const;
