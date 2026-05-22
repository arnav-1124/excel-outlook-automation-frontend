import { useEffect, useState } from "react";

import { getPlans } from "../services/api/plansApi";
import { previewSubscription } from "../services/api/subscriptionsApi";

function useSubscriptionPreview({ showBanner, showToast }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlanCode, setSelectedPlanCode] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [preview, setPreview] = useState(null);

  const [isPlansLoading, setIsPlansLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  async function loadPlans() {
    try {
      setIsPlansLoading(true);

      const loadedPlans = await getPlans();

      setPlans(loadedPlans);

      if (loadedPlans.length > 0 && !selectedPlanCode) {
        setSelectedPlanCode(loadedPlans[0].code);
      }

      return loadedPlans;
    } catch (error) {
      console.error("Load plans failed:", error);
      showBanner("error", error.message || "Could not load subscription plans.");
      return [];
    } finally {
      setIsPlansLoading(false);
    }
  }

  async function generatePreview({ planCode = selectedPlanCode, coupon = couponCode } = {}) {
    if (!planCode) {
      showBanner("error", "Please select a plan first.");
      return null;
    }

    try {
      setIsPreviewLoading(true);

      const result = await previewSubscription({
        planCode,
        couponCode: coupon?.trim() || undefined,
      });

      setPreview(result);

      if (coupon?.trim()) {
        showToast("success", "Coupon applied", "Subscription preview updated.");
      }

      return result;
    } catch (error) {
      console.error("Preview subscription failed:", error);
      setPreview(null);
      showBanner("error", error.message || "Could not preview subscription.");
      return null;
    } finally {
      setIsPreviewLoading(false);
    }
  }

  function clearCoupon() {
    setCouponCode("");
    setPreview(null);
  }

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (selectedPlanCode) {
      generatePreview({
        planCode: selectedPlanCode,
        coupon: couponCode,
      });
    }
  }, [selectedPlanCode]);

  return {
    plans,
    selectedPlanCode,
    setSelectedPlanCode,

    couponCode,
    setCouponCode,
    clearCoupon,

    preview,
    isPlansLoading,
    isPreviewLoading,

    loadPlans,
    generatePreview,
  };
}

export default useSubscriptionPreview;
