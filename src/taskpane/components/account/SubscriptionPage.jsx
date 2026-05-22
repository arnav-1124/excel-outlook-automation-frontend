import React from "react";
import UpgradePanel from "./UpgradePanel";

function SubscriptionPage({
  onBack,
  plans,
  selectedPlanCode,
  onSelectPlan,
  couponCode,
  onChangeCoupon,
  onApplyCoupon,
  onClearCoupon,
  preview,
  isPlansLoading,
  isPreviewLoading,
}) {
  return (
    <main className="subscription-page">
      <div className="subscription-page-header">
        <button className="subscription-back-btn" type="button" onClick={onBack}>
          ← Back
        </button>

        <div>
          <p className="subscription-kicker">Subscription</p>
          <h1 className="subscription-title">Upgrade your automation workspace</h1>
        </div>
      </div>

      <p className="subscription-subtitle">
        Choose a plan, apply coupon codes, and preview credits before payment activation.
      </p>

      <UpgradePanel
        plans={plans}
        selectedPlanCode={selectedPlanCode}
        onSelectPlan={onSelectPlan}
        couponCode={couponCode}
        onChangeCoupon={onChangeCoupon}
        onApplyCoupon={onApplyCoupon}
        onClearCoupon={onClearCoupon}
        preview={preview}
        isPlansLoading={isPlansLoading}
        isPreviewLoading={isPreviewLoading}
        forceExpanded
      />
    </main>
  );
}

export default SubscriptionPage;