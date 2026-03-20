import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { supabase } from "../lib/supabase";
import { useStore } from "../store/useStore";

// react-native-health is iOS-only and requires native module
// We'll use it conditionally and handle the case where it's not available
let AppleHealthKit: any = null;
if (Platform.OS === "ios") {
  try {
    AppleHealthKit = require("react-native-health").default;
  } catch {
    // Not available in Expo Go, only in dev client / production
  }
}

const HEALTHKIT_PERMISSIONS = {
  permissions: {
    read: ["StepCount"] as const,
    write: [] as const,
  },
};

export function useHealthKit() {
  const { profile, familyId } = useStore();
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [todaySteps, setTodaySteps] = useState<number>(0);
  const [yesterdaySteps, setYesterdaySteps] = useState<number>(0);

  useEffect(() => {
    if (Platform.OS !== "ios" || !AppleHealthKit) {
      setIsAvailable(false);
      return;
    }

    AppleHealthKit.isAvailable((err: any, available: boolean) => {
      setIsAvailable(available);
    });
  }, []);

  const requestAuthorization = useCallback(async (): Promise<boolean> => {
    if (!AppleHealthKit || !isAvailable) return false;

    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS, (err: string) => {
        if (err) {
          console.log("HealthKit init error:", err);
          resolve(false);
        } else {
          setIsAuthorized(true);
          resolve(true);
        }
      });
    });
  }, [isAvailable]);

  const fetchTodaySteps = useCallback(async (): Promise<number> => {
    if (!AppleHealthKit || !isAuthorized) return 0;

    return new Promise((resolve) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const options = {
        startDate: today.toISOString(),
        endDate: new Date().toISOString(),
      };

      AppleHealthKit.getStepCount(options, (err: any, results: any) => {
        if (err) {
          resolve(0);
        } else {
          const steps = Math.floor(results?.value || 0);
          setTodaySteps(steps);
          resolve(steps);
        }
      });
    });
  }, [isAuthorized]);

  const fetchYesterdaySteps = useCallback(async (): Promise<number> => {
    if (!AppleHealthKit || !isAuthorized) return 0;

    return new Promise((resolve) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const yesterdayEnd = new Date();
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);

      const options = {
        startDate: yesterday.toISOString(),
        endDate: yesterdayEnd.toISOString(),
      };

      AppleHealthKit.getStepCount(options, (err: any, results: any) => {
        if (err) {
          resolve(0);
        } else {
          const steps = Math.floor(results?.value || 0);
          setYesterdaySteps(steps);
          resolve(steps);
        }
      });
    });
  }, [isAuthorized]);

  const syncStepsToServer = useCallback(async () => {
    if (!profile || !familyId) return;

    const steps = await fetchTodaySteps();

    await supabase.from("health_signals").insert({
      senior_id: profile.id,
      family_id: familyId,
      signal_type: "steps",
      value: { steps },
      recorded_at: new Date().toISOString(),
    });

    return steps;
  }, [profile, familyId, fetchTodaySteps]);

  const startBackgroundSync = useCallback(async () => {
    // In production, this would use BackgroundTasks + HealthKit observer
    // For MVP, we sync when the app is opened or foregrounded
    if (!isAuthorized) {
      const authorized = await requestAuthorization();
      if (!authorized) return;
    }

    await fetchTodaySteps();
    await fetchYesterdaySteps();
    await syncStepsToServer();
  }, [isAuthorized, requestAuthorization, fetchTodaySteps, fetchYesterdaySteps, syncStepsToServer]);

  return {
    isAvailable,
    isAuthorized,
    todaySteps,
    yesterdaySteps,
    requestAuthorization,
    fetchTodaySteps,
    fetchYesterdaySteps,
    syncStepsToServer,
    startBackgroundSync,
  };
}
