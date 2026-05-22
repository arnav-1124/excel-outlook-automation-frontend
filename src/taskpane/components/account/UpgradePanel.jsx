import React, { useState } from "react";

function formatMoney(amount, currency = "INR") {
  const value = (amount || 0) / 100;

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}

function UpgradePanel({
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
  forceExpanded = false,
}) {
  const [expanded, setExpanded] = useState(forceExpanded);
  const isOpen = forceExpanded || expanded;

  const selectedPlan = plans.find((plan) => plan.code === selectedPlanCode);
  const pricing = preview?.pricing;
  const credits = preview?.credits;
  const coupon = preview?.coupon;

  return (
    <section
      className={`upgrade-panel ${isOpen ? "expanded" : "collapsed"} ${forceExpanded ? "page-mode" : ""}`}
    >
      <button
        className="upgrade-panel-toggle"
        type="button"
        onClick={() => {
          if (!forceExpanded) {
            setExpanded((value) => !value);
          }
        }}
      >
        <div className="upgrade-toggle-left">
          <div className="upgrade-toggle-icon">★</div>

          <div>
            <p className="upgrade-kicker">Subscription</p>
            <h2 className="upgrade-title">
              {selectedPlan ? `${selectedPlan.name} plan` : "Upgrade workspace"}
            </h2>
          </div>
        </div>

        <div className="upgrade-toggle-right">
          <span className="upgrade-pill">
            {pricing ? formatMoney(pricing.finalAmount, pricing.currency) : "Plans"}
          </span>

          {!forceExpanded && <span className={`upgrade-collapse-icon ${isOpen ? "open" : ""}`} />}
        </div>
      </button>

      {!isOpen && (
        <div className="upgrade-mini-summary">
          <span>
            {selectedPlan
              ? `${selectedPlan.automationCredits} credits / ${selectedPlan.interval.toLowerCase()}`
              : "Choose a plan"}
          </span>
          <span>Coupons supported</span>
        </div>
      )}

      {isOpen && (
        <div className="upgrade-content">
          {isPlansLoading && <div className="upgrade-empty">Loading plans...</div>}

          {!isPlansLoading && plans.length === 0 && (
            <div className="upgrade-empty">No active plans available.</div>
          )}

          {!isPlansLoading && plans.length > 0 && (
            <>
              <div className="plan-grid">
                {plans.map((plan) => {
                  const active = plan.code === selectedPlanCode;

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      className={`plan-card ${active ? "active" : ""}`}
                      onClick={() => onSelectPlan(plan.code)}
                    >
                      <div className="plan-card-top">
                        <div>
                          <h3>{plan.name}</h3>
                          <p>{plan.description}</p>
                        </div>

                        <span>{plan.interval}</span>
                      </div>

                      <div className="plan-price">
                        {formatMoney(plan.priceAmount, plan.currency)}
                      </div>

                      <div className="plan-credits">
                        {plan.automationCredits.toLocaleString("en-IN")} automation credits
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="coupon-box">
                <label className="account-field">
                  <span>Coupon code</span>
                  <div className="coupon-input-row">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(event) => onChangeCoupon(event.target.value.toUpperCase())}
                      placeholder="WELCOME50"
                    />

                    <button
                      className="coupon-apply-btn"
                      type="button"
                      onClick={onApplyCoupon}
                      disabled={isPreviewLoading || !selectedPlanCode}
                    >
                      {isPreviewLoading ? "Checking..." : "Apply"}
                    </button>
                  </div>
                </label>

                {coupon && (
                  <div className="coupon-applied">
                    <div>
                      <strong>{coupon.code}</strong>
                      <span>{coupon.description || "Coupon applied"}</span>
                    </div>

                    <button type="button" onClick={onClearCoupon}>
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {preview && (
                <div className="subscription-preview-card">
                  <div className="preview-row">
                    <span>Plan price</span>
                    <strong>{formatMoney(pricing.originalAmount, pricing.currency)}</strong>
                  </div>

                  <div className="preview-row discount">
                    <span>Discount</span>
                    <strong>-{formatMoney(pricing.discountAppliedAmount, pricing.currency)}</strong>
                  </div>

                  <div className="preview-row total">
                    <span>Payable now</span>
                    <strong>{formatMoney(pricing.finalAmount, pricing.currency)}</strong>
                  </div>

                  <div className="preview-credit-box">
                    <div>
                      <span>Plan credits</span>
                      <strong>{credits.planAutomationCredits.toLocaleString("en-IN")}</strong>
                    </div>

                    <div>
                      <span>Coupon credits</span>
                      <strong>{credits.extraAutomationCredits.toLocaleString("en-IN")}</strong>
                    </div>

                    <div>
                      <span>Total credits</span>
                      <strong>{credits.totalAutomationCredits.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                </div>
              )}

              <button
                className="upgrade-primary-btn"
                type="button"
                disabled
                title="Razorpay integration will be added later"
              >
                Continue to payment soon
              </button>

              <p className="upgrade-note">
                Payment activation will be connected after Razorpay setup. Pricing and coupon
                preview already comes from backend.
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default UpgradePanel;
