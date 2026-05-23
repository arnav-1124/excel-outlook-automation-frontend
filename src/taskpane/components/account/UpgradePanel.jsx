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
  previewError,
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
    <section className={`ds-upgrade-panel ${isOpen ? "expanded" : "collapsed"}`}>
      <button
        className="ds-upgrade-toggle"
        type="button"
        onClick={() => {
          if (!forceExpanded) {
            setExpanded((value) => !value);
          }
        }}
      >
        <div>
          <p>Billing control</p>
          <h2>{selectedPlan ? `${selectedPlan.name} plan` : "Choose your plan"}</h2>
        </div>

        <div className="ds-upgrade-toggle-right">
          <span>{pricing ? formatMoney(pricing.finalAmount, pricing.currency) : "Plans"}</span>

          {!forceExpanded && <i className={isOpen ? "open" : ""} />}
        </div>
      </button>

      {!isOpen && (
        <div className="ds-upgrade-mini-summary">
          <span>
            {selectedPlan
              ? `${selectedPlan.automationCredits} credits / ${selectedPlan.interval.toLowerCase()}`
              : "Choose a plan"}
          </span>
          <span>Coupons supported</span>
        </div>
      )}

      {isOpen && (
        <div className="ds-upgrade-content">
          {isPlansLoading && <div className="ds-empty-panel">Loading plans...</div>}

          {!isPlansLoading && plans.length === 0 && (
            <div className="ds-empty-panel">No active plans available.</div>
          )}

          {!isPlansLoading && plans.length > 0 && (
            <>
              <section className="ds-dashboard-panel">
                <div className="ds-dashboard-panel-header">
                  <div>
                    <p className="ds-dashboard-panel-title">Available plans</p>
                    <h3 className="ds-upgrade-section-heading">Pick the credit bundle you need.</h3>
                  </div>
                </div>

                <div className="ds-dashboard-panel-body">
                  <div className="ds-plan-grid">
                    {plans.map((plan) => {
                      const active = plan.code === selectedPlanCode;

                      return (
                        <button
                          key={plan.id}
                          type="button"
                          className={`ds-plan-card ${active ? "active" : ""}`}
                          onClick={() => onSelectPlan(plan.code)}
                        >
                          <div className="ds-plan-card-top">
                            <div>
                              <h3>{plan.name}</h3>
                              <p>{plan.description}</p>
                            </div>

                            <span>{plan.interval}</span>
                          </div>

                          <div className="ds-plan-card-bottom">
                            <strong>{formatMoney(plan.priceAmount, plan.currency)}</strong>
                            <small>
                              {plan.automationCredits.toLocaleString("en-IN")} automation credits
                            </small>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="ds-dashboard-panel">
                <div className="ds-dashboard-panel-header">
                  <div>
                    <p className="ds-dashboard-panel-title">Coupon</p>
                    <h3 className="ds-upgrade-section-heading">Apply discount or extra credits.</h3>
                  </div>
                </div>

                <div className="ds-dashboard-panel-body">
                  <label className="account-field ds-coupon-field">
                    <span>Coupon code</span>

                    <div className="ds-coupon-input-row">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(event) => onChangeCoupon(event.target.value.toUpperCase())}
                        placeholder="WELCOME50"
                      />

                      <button
                        className="ds-button-primary ds-coupon-apply-btn"
                        type="button"
                        onClick={onApplyCoupon}
                        disabled={isPreviewLoading || !selectedPlanCode}
                      >
                        {isPreviewLoading ? "Checking..." : "Apply"}
                      </button>
                    </div>
                  </label>

                  {coupon && (
                    <div className="ds-coupon-applied">
                      <div>
                        <strong>{coupon.code}</strong>
                        <span>{coupon.description || "Coupon applied"}</span>
                      </div>

                      <button type="button" onClick={onClearCoupon}>
                        Remove
                      </button>
                    </div>
                  )}

                  {previewError && (
                    <div className="ds-alert error ds-coupon-error">{previewError}</div>
                  )}
                </div>
              </section>

              {preview && (
                <section className="ds-dashboard-panel">
                  <div className="ds-dashboard-panel-header">
                    <div>
                      <p className="ds-dashboard-panel-title">Preview</p>
                      <h3 className="ds-upgrade-section-heading">Billing and credits summary.</h3>
                    </div>
                  </div>

                  <div className="ds-dashboard-panel-body">
                    <div className="ds-subscription-preview">
                      <div>
                        <span>Plan price</span>
                        <strong>{formatMoney(pricing.originalAmount, pricing.currency)}</strong>
                      </div>

                      <div>
                        <span>Discount</span>
                        <strong>
                          -{formatMoney(pricing.discountAppliedAmount, pricing.currency)}
                        </strong>
                      </div>

                      <div className="total">
                        <span>Payable now</span>
                        <strong>{formatMoney(pricing.finalAmount, pricing.currency)}</strong>
                      </div>
                    </div>

                    <div className="ds-credit-preview-grid">
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
                </section>
              )}

              <section className="ds-upgrade-payment-card">
                <div>
                  <p>Secure payment</p>
                  <h3>Razorpay integration reserved for commercial activation.</h3>
                  <span>
                    Pricing, coupon logic, discount calculation, and credit preview are already
                    backend-powered.
                  </span>
                </div>

                <button
                  className="ds-button-primary"
                  type="button"
                  disabled
                  title="Razorpay integration will be added later"
                >
                  Continue to payment
                </button>
              </section>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default UpgradePanel;
