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
    <main className="ds-page ds-subscription-page">
      <button className="ds-back-btn" type="button" onClick={onBack}>
        ← Back to workflow
      </button>

      <section className="ds-hero ds-subscription-hero">
        <div className="ds-hero-content">
          <div className="ds-pill">Subscription workspace</div>

          <h1 className="ds-title">Upgrade when automation becomes your daily system.</h1>

          <p className="ds-subtitle">
            Choose a plan, apply coupons, and preview exactly how many automation credits will be
            added before payment activation.
          </p>
        </div>
      </section>

      <div className="ds-subscription-proof-grid">
        <div className="ds-subscription-proof-card">
          <span>01</span>
          <strong>Plan credits</strong>
          <p>Every plan grants a clean automation credit bundle.</p>
        </div>

        <div className="ds-subscription-proof-card">
          <span>02</span>
          <strong>Coupons</strong>
          <p>Discount price, add extra credits, or control both from admin.</p>
        </div>

        <div className="ds-subscription-proof-card">
          <span>03</span>
          <strong>Payment ready</strong>
          <p>Razorpay can plug into this flow when we activate billing.</p>
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
