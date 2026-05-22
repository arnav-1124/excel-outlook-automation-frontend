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
  previewError,
  isPlansLoading,
  isPreviewLoading,
}) {
  return (
    <main className="subscription-page">
      <div className="subscription-hero">
        <button className="subscription-back-btn" type="button" onClick={onBack}>
          ← Back to workflow
        </button>

        <div className="subscription-hero-card">
          <div className="subscription-hero-icon">★</div>

          <div>
            <p className="subscription-kicker">Subscription</p>
            <h1 className="subscription-title">Upgrade your automation workspace</h1>
            <p className="subscription-subtitle">
              Pick a plan, apply coupons, and preview your final credits before payment.
            </p>
          </div>
        </div>
      </div>

      <UpgradePanel
        plans={plans}
        selectedPlanCode={selectedPlanCode}
        onSelectPlan={onSelectPlan}
        couponCode={couponCode}
        onChangeCoupon={onChangeCoupon}
        onApplyCoupon={onApplyCoupon}
        onClearCoupon={onClearCoupon}
        preview={preview}
        previewError={previewError}
        isPlansLoading={isPlansLoading}
        isPreviewLoading={isPreviewLoading}
        forceExpanded
      />
    </main>
  );
}

export default SubscriptionPage;
