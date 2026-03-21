import { useState } from "react";

// Push notifications require aps-environment entitlement
// which is only available in production builds with proper provisioning.
// For dev builds, we provide a no-op implementation.

export function useNotifications() {
  const [expoPushToken] = useState<string | null>(null);

  async function scheduleDailyCheckin(_hour: number = 7, _minute: number = 0) {
    // No-op in dev builds without push notification entitlement
    // Will be enabled in production builds
  }

  async function sendLocalNotification(_title: string, _body: string, _data?: Record<string, unknown>) {
    // No-op in dev builds
  }

  return {
    expoPushToken,
    scheduleDailyCheckin,
    sendLocalNotification,
  };
}
