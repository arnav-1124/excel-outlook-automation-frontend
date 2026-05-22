import { useEffect, useState } from "react";

import {
  getFollowUps,
  getFollowUpSummary,
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
      loadFollowUps({
        bucket: activeFollowUpBucket,
      });
    } else {
      setFollowUps([]);
      setFollowUpSummary(null);
    }
  }, [isAuthenticated]);

  return {
    followUps,
    followUpSummary,
    activeFollowUpBucket,
    isFollowUpsLoading,
    followUpsError,

    loadFollowUps,
    loadFollowUpSummary,
    setActiveFollowUpBucket,

    markFollowUpResolved,
    snoozeFollowUpItem,
    reopenFollowUpItem,
    cancelFollowUpItem,
  };
}

export default useFollowUps;
