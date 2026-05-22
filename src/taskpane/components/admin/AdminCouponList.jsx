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

function AdminCouponList({ coupons, isLoading, onEditCoupon, onChangeStatus }) {
  if (isLoading && coupons.length === 0) {
    return <div className="admin-empty-state">Loading coupons...</div>;
  }

  if (coupons.length === 0) {
    return (
      <div className="admin-empty-state">
        <strong>No coupons yet</strong>
        <span>Create your first coupon to offer discounts or bonus credits.</span>
      </div>
    );
  }

  return (
    <div className="admin-coupon-list">
      {coupons.map((coupon) => {
        const isActive = coupon.status === "ACTIVE";

        return (
          <article className="admin-coupon-card" key={coupon.id}>
            <div className="admin-coupon-top">
              <div>
                <div className="admin-coupon-code">{coupon.code}</div>
                <p className="admin-coupon-description">
                  {coupon.description || "No description added."}
                </p>
              </div>

              <span className={`admin-status-badge ${coupon.status.toLowerCase()}`}>
                {coupon.status}
              </span>
            </div>

            <div className="admin-coupon-grid">
              <div>
                <span>Discount</span>
                <strong>{formatDiscount(coupon)}</strong>
              </div>

              <div>
                <span>Extra credits</span>
                <strong>{coupon.extraAutomationCredits || 0}</strong>
              </div>

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

            <div className="admin-coupon-actions">
              <button
                className="admin-secondary-btn"
                type="button"
                onClick={() => onEditCoupon(coupon)}
              >
                Edit
              </button>

              <button
                className={isActive ? "admin-danger-btn" : "admin-success-btn"}
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
