import React from "react";

function formatDiscount(coupon) {
  if (coupon.discountType === "PERCENTAGE") {
    return `${coupon.discountValue}% off`;
  }

  if (coupon.discountType === "FIXED_AMOUNT") {
    return `₹${Math.round((coupon.discountValue || 0) / 100)} off`;
  }

  return "No price discount";
}

function getCouponUsageText(coupon) {
  const redeemed = coupon._count?.redemptions ?? 0;

  if (!coupon.maxTotalRedemptions) {
    return `${redeemed} used`;
  }

  return `${redeemed}/${coupon.maxTotalRedemptions} used`;
}

function getCouponValueText(coupon) {
  const parts = [];

  parts.push(formatDiscount(coupon));

  if (coupon.extraAutomationCredits) {
    parts.push(`+${coupon.extraAutomationCredits} automation credits`);
  }

  if (coupon.extraAiCredits) {
    parts.push(`+${coupon.extraAiCredits} AI credits`);
  }

  return parts.join(" · ");
}

function AdminCouponList({ coupons, isLoading, onEditCoupon, onChangeStatus }) {
  if (isLoading && coupons.length === 0) {
    return <div className="ds-empty-panel">Loading coupons...</div>;
  }

  if (coupons.length === 0) {
    return (
      <div className="ds-empty-panel">No coupons yet. Create your first offer rule above.</div>
    );
  }

  return (
    <div className="ds-admin-coupon-list">
      {coupons.map((coupon) => {
        const isActive = coupon.status === "ACTIVE";

        return (
          <article className="ds-admin-coupon-card" key={coupon.id}>
            <div className="ds-admin-coupon-top">
              <div>
                <div className="ds-admin-coupon-code-row">
                  <strong>{coupon.code}</strong>
                  <span className={`ds-admin-status-badge ${coupon.status.toLowerCase()}`}>
                    {coupon.status}
                  </span>
                </div>

                <p>{coupon.description || "No description added."}</p>
              </div>
            </div>

            <div className="ds-admin-coupon-value">
              <span>Offer value</span>
              <strong>{getCouponValueText(coupon)}</strong>
            </div>

            <div className="ds-admin-coupon-detail-grid">
              <div>
                <span>Usage</span>
                <strong>{getCouponUsageText(coupon)}</strong>
              </div>

              <div>
                <span>Plans</span>
                <strong>
                  {coupon.allowedPlanCodes?.length
                    ? coupon.allowedPlanCodes.join(", ")
                    : "All plans"}
                </strong>
              </div>
            </div>

            <div className="ds-admin-coupon-actions">
              <button
                className="ds-button-secondary"
                type="button"
                onClick={() => onEditCoupon(coupon)}
              >
                Edit
              </button>

              <button
                className={isActive ? "ds-admin-danger-action" : "ds-admin-success-action"}
                type="button"
                onClick={() => onChangeStatus(coupon, isActive ? "INACTIVE" : "ACTIVE")}
              >
                {isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default AdminCouponList;
