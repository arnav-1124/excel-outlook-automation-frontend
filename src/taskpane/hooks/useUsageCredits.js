import { useEffect, useState } from "react";

import { initGuestUsage, getMyUsage, checkUsage, consumeUsage } from "../services/api/usageApi";

function useUsageCredits({ isAuthenticated, showToast, showBanner, addActivity }) {
  const [usage, setUsage] = useState(null);
  const [isUsageLoading, setIsUsageLoading] = useState(false);

  async function loadUsage() {
    try {
      setIsUsageLoading(true);

      if (!isAuthenticated) {
        await initGuestUsage();
      }

      const currentUsage = await getMyUsage();

      setUsage(currentUsage);

      return currentUsage;
    } catch (error) {
      console.error("Load usage failed:", error);
      showBanner("warning", "Could not load usage credits.");
      return null;
    } finally {
      setIsUsageLoading(false);
    }
  }

  async function ensureCreditsAvailable({ creditsRequired = 1 } = {}) {
    try {
      const result = await checkUsage({ creditsRequired });

      if (!result.allowed) {
        if (result.shouldSignup) {
          showBanner("error", "Guest credits finished. Please create an account to continue.");
        } else if (result.shouldUpgrade) {
          showBanner(
            "error",
            "Credits finished. Please upgrade your plan or purchase more credits."
          );
        } else {
          showBanner("error", result.reason || "Insufficient credits.");
        }

        return false;
      }

      return true;
    } catch (error) {
      showBanner("error", error.message || "Could not check credits.");
      return false;
    }
  }

  async function consumeAutomationCredit({ metadata = {} } = {}) {
    try {
      const result = await consumeUsage({
        creditsToConsume: 1,
        source: "excel_outlook_addin",
        description: "Email automation workflow completed.",
        metadata,
      });

      setUsage({
        hasUsageAccount: true,
        id: result.usageAccount.id,
        creditsRemaining: result.usageAccount.creditsRemaining,
        creditsUsed: result.usageAccount.creditsUsed,
        totalCreditsGranted: result.usageAccount.totalCreditsGranted,
        accountType: isAuthenticated ? "USER" : "GUEST",
        currentPlan: result.usageAccount.currentPlan || null,
        subscription: result.usageAccount.subscription || null,
      });

      addActivity("success", "1 automation credit consumed.");

      return result;
    } catch (error) {
      showBanner("error", error.message || "Could not consume credit.");
      throw error;
    }
  }

  useEffect(() => {
    loadUsage();
  }, [isAuthenticated]);

  return {
    usage,
    isUsageLoading,
    loadUsage,
    ensureCreditsAvailable,
    consumeAutomationCredit,
  };
}

export default useUsageCredits;
