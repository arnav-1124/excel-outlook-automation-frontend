import { useEffect, useState } from "react";

import {
  getMyNotificationPreference,
  updateMyNotificationPreference,
} from "../services/api/notificationPreferencesApi";

const DEFAULT_NOTIFICATION_PREFERENCE = {
  emailEnabled: true,
  whatsappEnabled: false,
  inAppEnabled: true,
  whatsappPhoneNumber: "",
  dailyDigestEnabled: true,
  reminderHourLocal: 9,
  timezone: "Asia/Kolkata",
};

function normalizePreference(preference) {
  if (!preference) return DEFAULT_NOTIFICATION_PREFERENCE;

  return {
    emailEnabled: Boolean(preference.emailEnabled),
    whatsappEnabled: Boolean(preference.whatsappEnabled),
    inAppEnabled: Boolean(preference.inAppEnabled),
    whatsappPhoneNumber: preference.whatsappPhoneNumber || "",
    dailyDigestEnabled: Boolean(preference.dailyDigestEnabled),
    reminderHourLocal:
      typeof preference.reminderHourLocal === "number" ? preference.reminderHourLocal : 9,
    timezone: preference.timezone || "Asia/Kolkata",
  };
}

function useNotificationPreferences({ isAuthenticated, showToast, showBanner }) {
  const [notificationPreference, setNotificationPreference] = useState(
    DEFAULT_NOTIFICATION_PREFERENCE
  );

  const [isNotificationPreferenceLoading, setIsNotificationPreferenceLoading] = useState(false);
  const [notificationPreferenceError, setNotificationPreferenceError] = useState("");

  async function loadNotificationPreference() {
    if (!isAuthenticated) {
      setNotificationPreference(DEFAULT_NOTIFICATION_PREFERENCE);
      setNotificationPreferenceError("");
      return null;
    }

    try {
      setIsNotificationPreferenceLoading(true);
      setNotificationPreferenceError("");

      const data = await getMyNotificationPreference();
      const normalized = normalizePreference(data);

      setNotificationPreference(normalized);
      return normalized;
    } catch (error) {
      console.error("Load notification preferences failed:", error);

      const message = error.message || "Could not load notification preferences.";
      setNotificationPreferenceError(message);
      showBanner("error", message);

      return null;
    } finally {
      setIsNotificationPreferenceLoading(false);
    }
  }

  async function saveNotificationPreference(payload) {
    if (!isAuthenticated) {
      showBanner("info", "Sign in to manage notification preferences.");
      return null;
    }

    try {
      setIsNotificationPreferenceLoading(true);
      setNotificationPreferenceError("");

      const data = await updateMyNotificationPreference(payload);
      const normalized = normalizePreference(data);

      setNotificationPreference(normalized);

      showToast(
        "success",
        "Notification preferences saved",
        "Reminder settings have been updated."
      );

      return normalized;
    } catch (error) {
      console.error("Save notification preferences failed:", error);

      const message = error.message || "Could not save notification preferences.";
      setNotificationPreferenceError(message);
      showBanner("error", message);

      return null;
    } finally {
      setIsNotificationPreferenceLoading(false);
    }
  }

  useEffect(() => {
    loadNotificationPreference();
  }, [isAuthenticated]);

  return {
    notificationPreference,
    isNotificationPreferenceLoading,
    notificationPreferenceError,

    loadNotificationPreference,
    saveNotificationPreference,
  };
}

export default useNotificationPreferences;
