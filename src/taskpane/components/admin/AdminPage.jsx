import React from "react";

import AdminCouponForm from "./AdminCouponForm";
import AdminCouponList from "./AdminCouponList";

function AdminPage({
  onBack,
  plans,
  coupons,
  couponForm,
  setCouponForm,
  editingCouponId,
  isLoading,
  error,
  onSaveCoupon,
  onResetCouponForm,
  onEditCoupon,
  onChangeCouponStatus,
}) {
  const activeCoupons = coupons.filter((coupon) => coupon.status === "ACTIVE").length;
  const inactiveCoupons = coupons.length - activeCoupons;

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <button className="admin-back-btn" type="button" onClick={onBack}>
          ← Back to workflow
        </button>

        <div className="admin-hero-card">
          <div className="admin-hero-icon">⚙</div>

          <div>
            <p className="admin-kicker">Admin Console</p>
            <h1 className="admin-title">Product control center</h1>
            <p className="admin-subtitle">
              Manage coupons, plan behavior, and commercial rules from one controlled workspace.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-metric-grid">
        <div className="admin-metric-card">
          <span>Total coupons</span>
          <strong>{coupons.length}</strong>
        </div>

        <div className="admin-metric-card">
          <span>Active</span>
          <strong>{activeCoupons}</strong>
        </div>

        <div className="admin-metric-card">
          <span>Inactive / expired</span>
          <strong>{inactiveCoupons}</strong>
        </div>
      </div>

      <AdminCouponForm
        form={couponForm}
        setForm={setCouponForm}
        editingCouponId={editingCouponId}
        plans={plans}
        isLoading={isLoading}
        error={error}
        onSave={onSaveCoupon}
        onCancel={onResetCouponForm}
      />

      <section className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <p className="admin-section-kicker">Coupons</p>
            <h2>Coupon manager</h2>
          </div>

          <span className="admin-section-pill">
            {isLoading ? "Syncing..." : `${coupons.length} records`}
          </span>
        </div>

        <AdminCouponList
          coupons={coupons}
          isLoading={isLoading}
          onEditCoupon={onEditCoupon}
          onChangeStatus={onChangeCouponStatus}
        />
      </section>
    </div>
  );
}

export default AdminPage;
