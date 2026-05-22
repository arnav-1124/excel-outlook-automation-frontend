import { useEffect, useState } from "react";

import { getAdminCoupons, createAdminCoupon, updateAdminCoupon } from "../services/api/adminApi";

function getEmptyCouponForm() {
  return {
    code: "",
    description: "",
    discountType: "NONE",
    discountValue: 0,
    extraAutomationCredits: 0,
    extraAiCredits: 0,
    maxTotalRedemptions: "",
    maxRedemptionsPerUser: 1,
    validFrom: "",
    validUntil: "",
    minimumPlanCode: "",
    allowedPlanCodes: [],
    status: "ACTIVE",
  };
}

function normalizeCouponPayload(form) {
  return {
    code: form.code.trim().toUpperCase(),
    description: form.description.trim() || undefined,
    discountType: form.discountType,
    discountValue: Number(form.discountValue || 0),
    extraAutomationCredits: Number(form.extraAutomationCredits || 0),
    extraAiCredits: Number(form.extraAiCredits || 0),
    maxTotalRedemptions: form.maxTotalRedemptions ? Number(form.maxTotalRedemptions) : null,
    maxRedemptionsPerUser: Number(form.maxRedemptionsPerUser || 1),
    validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
    validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
    minimumPlanCode: form.minimumPlanCode?.trim().toUpperCase() || null,
    allowedPlanCodes: form.allowedPlanCodes || [],
    status: form.status,
  };
}

function useAdminCoupons({ isAdmin, showToast, showBanner }) {
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState(getEmptyCouponForm());
  const [editingCouponId, setEditingCouponId] = useState(null);

  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  async function loadCoupons() {
    if (!isAdmin) return [];

    try {
      setIsAdminLoading(true);
      setAdminError("");

      const data = await getAdminCoupons();

      setCoupons(data);
      return data;
    } catch (error) {
      console.error("Load admin coupons failed:", error);
      setAdminError(error.message || "Could not load coupons.");
      showBanner("error", error.message || "Could not load admin coupons.");
      return [];
    } finally {
      setIsAdminLoading(false);
    }
  }

  function resetCouponForm() {
    setCouponForm(getEmptyCouponForm());
    setEditingCouponId(null);
    setAdminError("");
  }

  function startEditingCoupon(coupon) {
    setEditingCouponId(coupon.id);
    setAdminError("");

    setCouponForm({
      code: coupon.code || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "NONE",
      discountValue: coupon.discountValue || 0,
      extraAutomationCredits: coupon.extraAutomationCredits || 0,
      extraAiCredits: coupon.extraAiCredits || 0,
      maxTotalRedemptions: coupon.maxTotalRedemptions || "",
      maxRedemptionsPerUser: coupon.maxRedemptionsPerUser || 1,
      validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 16) : "",
      validUntil: coupon.validUntil ? coupon.validUntil.slice(0, 16) : "",
      minimumPlanCode: coupon.minimumPlanCode || "",
      allowedPlanCodes: coupon.allowedPlanCodes || [],
      status: coupon.status || "ACTIVE",
    });
  }

  async function saveCoupon() {
    try {
      setIsAdminLoading(true);
      setAdminError("");

      const payload = normalizeCouponPayload(couponForm);

      if (!payload.code) {
        setAdminError("Coupon code is required.");
        return null;
      }

      const savedCoupon = editingCouponId
        ? await updateAdminCoupon(editingCouponId, payload)
        : await createAdminCoupon(payload);

      showToast(
        "success",
        editingCouponId ? "Coupon updated" : "Coupon created",
        `${savedCoupon.code} is ready.`
      );

      await loadCoupons();
      resetCouponForm();

      return savedCoupon;
    } catch (error) {
      console.error("Save coupon failed:", error);
      setAdminError(error.message || "Could not save coupon.");
      return null;
    } finally {
      setIsAdminLoading(false);
    }
  }

  async function changeCouponStatus(coupon, status) {
    try {
      setIsAdminLoading(true);
      setAdminError("");

      await updateAdminCoupon(coupon.id, {
        status,
      });

      showToast("success", "Coupon updated", `${coupon.code} is now ${status}.`);

      await loadCoupons();
    } catch (error) {
      console.error("Update coupon status failed:", error);
      setAdminError(error.message || "Could not update coupon status.");
    } finally {
      setIsAdminLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, [isAdmin]);

  return {
    coupons,
    couponForm,
    setCouponForm,
    editingCouponId,

    isAdminLoading,
    adminError,

    loadCoupons,
    resetCouponForm,
    startEditingCoupon,
    saveCoupon,
    changeCouponStatus,
  };
}

export default useAdminCoupons;
