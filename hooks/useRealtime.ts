import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useStore } from "../store/useStore";

type RealtimeCallback = (payload: any) => void;

export function useRealtimeCheckins(onNewCheckin: RealtimeCallback) {
  const { familyId } = useStore();

  useEffect(() => {
    if (!familyId) return;

    const channel = supabase
      .channel(`checkins-${familyId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "check_ins",
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          onNewCheckin(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, onNewCheckin]);
}

export function useRealtimeSignals(onNewSignal: RealtimeCallback) {
  const { familyId } = useStore();

  useEffect(() => {
    if (!familyId) return;

    const channel = supabase
      .channel(`signals-${familyId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "health_signals",
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          onNewSignal(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, onNewSignal]);
}

export function useRealtimeAlerts(onNewAlert: RealtimeCallback) {
  const { familyId } = useStore();

  useEffect(() => {
    if (!familyId) return;

    const channel = supabase
      .channel(`alerts-${familyId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerts",
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          onNewAlert(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, onNewAlert]);
}
