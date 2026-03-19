import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { supabase } from "../lib/supabase";
import { useStore } from "../store/useStore";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const { profile } = useStore();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<{ remove: () => void } | null>(null);
  const responseListener = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) {
        setExpoPushToken(token);
        savePushToken(token);
      }
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        // Handle foreground notification
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.type === "checkin_request") {
          // Navigate to check-in screen or auto check-in
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  async function registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "MimamoriBridge",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4CAF50",
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "mimamori-bridge",
    });

    return tokenData.data;
  }

  async function savePushToken(token: string) {
    if (!profile) return;

    await supabase
      .from("notification_settings")
      .upsert(
        {
          user_id: profile.id,
          expo_push_token: token,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
  }

  async function scheduleDailyCheckin(hour: number = 7, minute: number = 0) {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "おはようございます ☀️",
        body: "タップして家族に元気を伝えましょう",
        data: { type: "checkin_request" },
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }

  async function sendLocalNotification(title: string, body: string, data?: Record<string, unknown>) {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: "default" },
      trigger: null,
    });
  }

  return {
    expoPushToken,
    scheduleDailyCheckin,
    sendLocalNotification,
  };
}
