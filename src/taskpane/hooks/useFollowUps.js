import { useEffect, useState } from "react";

import {
  createFollowUp,
  getFollowUps,
  getFollowUpSummary,
  getFollowUpReminderHistory,
  resolveFollowUp,
  snoozeFollowUp,
  reopenFollowUp,
  cancelFollowUp,
} from "../services/api/followUpsApi";

function useFollowUps({ isAuthenticated, showToast, showBanner, addActivity }) {
  const [followUps, setFollowUps] = useState([]);
  const [followUpSummary, setFollowUpSummary] = useState(null);
  const [activeFollowUpBucket, setActiveFollowUpBucket] = useState("dueToday");

  const [isFollowUpsLoading, setIsFollowUpsLoading] = useState(false);
  const [followUpsError, setFollowUpsError] = useState("");

  const [reminderHistory, setReminderHistory] = useState([]);
  const [isReminderHistoryLoading, setIsReminderHistoryLoading] = useState(false);

  async function loadFollowUpSummary() {
    if (!isAuthenticated) {
      setFollowUpSummary(null);
      return null;
    }

    try {
      const summary = await getFollowUpSummary();
      setFollowUpSummary(summary);
      return summary;
    } catch (error) {
      console.error("Load follow-up summary failed:", error);
      return null;
    }
  }

  async function loadFollowUps({ bucket = activeFollowUpBucket } = {}) {
    if (!isAuthenticated) {
      setFollowUps([]);
      setFollowUpsError("");
      return [];
    }

    try {
      setIsFollowUpsLoading(true);
      setFollowUpsError("");

      const data = await getFollowUps({
        bucket,
        limit: 50,
      });

      setFollowUps(data);
      setActiveFollowUpBucket(bucket);

      await loadFollowUpSummary();

      await loadReminderHistory();

      return data;
    } catch (error) {
      console.error("Load follow-ups failed:", error);
      setFollowUpsError(error.message || "Could not load follow-ups.");
      showBanner("error", error.message || "Could not load follow-ups.");
      return [];
    } finally {
      setIsFollowUpsLoading(false);
    }
  }

  async function createFollowUpItem(payload) {
    if (!isAuthenticated) {
      const error = new Error("Sign in to save follow-ups and receive reminders.");
      showBanner("info", error.message);
      throw error;
    }

    try {
      setIsFollowUpsLoading(true);
      setFollowUpsError("");

      const created = await createFollowUp(payload);

      showToast("success", "Follow-up created", "This reminder is now being tracked.");

      addActivity("success", "Follow-up created from Excel row.");

      await loadFollowUpSummary();
      await loadFollowUps({
        bucket: activeFollowUpBucket,
      });

      return created;
    } catch (error) {
      console.error("Create follow-up failed:", error);

      const message = error.message || "Could not create follow-up.";
      setFollowUpsError(message);

      throw new Error(message);
    } finally {
      setIsFollowUpsLoading(false);
    }
  }

  async function markFollowUpResolved(id) {
    try {
      await resolveFollowUp(id);
      showToast("success", "Follow-up resolved", "Nice. This follow-up is now closed.");
      addActivity("success", "Follow-up marked as resolved.");
      await loadFollowUps();
    } catch (error) {
      showBanner("error", error.message || "Could not resolve follow-up.");
    }
  }

  async function snoozeFollowUpItem(id, days = 2) {
    try {
      const snoozedUntil = new Date();
      snoozedUntil.setDate(snoozedUntil.getDate() + days);
      snoozedUntil.setHours(9, 0, 0, 0);

      await snoozeFollowUp(id, {
        snoozedUntil: snoozedUntil.toISOString(),
        note: `Snoozed for ${days} day${days > 1 ? "s" : ""}.`,
      });

      showToast("success", "Follow-up snoozed", `Reminder moved by ${days} days.`);
      addActivity("success", `Follow-up snoozed for ${days} days.`);
      await loadFollowUps();
    } catch (error) {
      showBanner("error", error.message || "Could not snooze follow-up.");
    }
  }

  async function reopenFollowUpItem(id) {
    try {
      await reopenFollowUp(id);
      showToast("success", "Follow-up reopened", "This follow-up is active again.");
      await loadFollowUps();
    } catch (error) {
      showBanner("error", error.message || "Could not reopen follow-up.");
    }
  }

  async function cancelFollowUpItem(id) {
    try {
      await cancelFollowUp(id);
      showToast("success", "Follow-up cancelled", "This follow-up was cancelled.");
      await loadFollowUps();
    } catch (error) {
      showBanner("error", error.message || "Could not cancel follow-up.");
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadFollowUpSummary();

      loadReminderHistory();

      loadFollowUps({
        bucket: activeFollowUpBucket,
      });
    } else {
      setFollowUps([]);
      setFollowUpSummary(null);
    }
  }, [isAuthenticated]);

  async function loadReminderHistory() {
    if (!isAuthenticated) {
      setReminderHistory([]);
      return [];
    }

    try {
      setIsReminderHistoryLoading(true);

      const data = await getFollowUpReminderHistory({
        limit: 20,
      });

      setReminderHistory(data);
      return data;
    } catch (error) {
      console.error("Load reminder history failed:", error);
      return [];
    } finally {
      setIsReminderHistoryLoading(false);
    }
  }

  return {
    followUps,
    followUpSummary,
    reminderHistory,
    activeFollowUpBucket,
    isFollowUpsLoading,
    isReminderHistoryLoading,
    followUpsError,

    loadFollowUps,
    loadFollowUpSummary,
    loadReminderHistory,
    setActiveFollowUpBucket,

    createFollowUpItem,
    markFollowUpResolved,
    snoozeFollowUpItem,
    reopenFollowUpItem,
    cancelFollowUpItem,
  };
}

export default useFollowUps;
