import React, { useRef } from "react";

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

  const couponFormRef = useRef(null);

  function scrollToCouponForm() {
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (couponFormRef.current) {
          couponFormRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 80);
    });
  }

  function handleCreateCouponFocus() {
    onResetCouponForm();
    scrollToCouponForm();
  }

  function handleEditCoupon(coupon) {
    onEditCoupon(coupon);
    scrollToCouponForm();
  }

  const totalAutomationCreditsGranted = coupons.reduce(
    (total, coupon) => total + Number(coupon.extraAutomationCredits || 0),
    0
  );

  return (
    <main className="ds-page ds-admin-page">
      <button className="ds-back-btn" type="button" onClick={onBack}>
        ← Back to workflow
      </button>

      <section className="ds-hero ds-admin-hero">
        <div className="ds-hero-content">
          <div className="ds-pill">Admin console</div>

          <h1 className="ds-title">Product control, without database guesswork.</h1>

          <p className="ds-subtitle">
            Manage coupons, commercial rules, credit bonuses, validity windows, and plan
            restrictions from one controlled workspace.
          </p>

          <div className="ds-button-row">
            <button className="ds-button-primary" type="button" onClick={handleCreateCouponFocus}>
              Create coupon
            </button>

            <button
              className="ds-button-secondary"
              type="button"
              onClick={() => {
                const couponList = document.querySelector(".ds-admin-coupon-panel");

                if (couponList) {
                  couponList.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }}
            >
              View coupons
            </button>
          </div>
        </div>
      </section>

      <div className="ds-stat-grid ds-admin-stat-grid">
        <div className="ds-stat-card">
          <div className="ds-stat-icon">#</div>

          <div>
            <p className="ds-stat-label">Total coupons</p>
            <div className="ds-stat-value-row">
              <strong className="ds-stat-value">{coupons.length}</strong>
              <span className="ds-stat-help">records</span>
            </div>
          </div>
        </div>

        <div className="ds-stat-card">
          <div className="ds-stat-icon">✓</div>

          <div>
            <p className="ds-stat-label">Active</p>
            <div className="ds-stat-value-row">
              <strong className="ds-stat-value">{activeCoupons}</strong>
              <span className="ds-stat-help">usable now</span>
            </div>
          </div>
        </div>

        <div className="ds-stat-card">
          <div className="ds-stat-icon">–</div>

          <div>
            <p className="ds-stat-label">Inactive / expired</p>
            <div className="ds-stat-value-row">
              <strong className="ds-stat-value">{inactiveCoupons}</strong>
              <span className="ds-stat-help">not usable</span>
            </div>
          </div>
        </div>

        <div className="ds-stat-card">
          <div className="ds-stat-icon">＋</div>

          <div>
            <p className="ds-stat-label">Bonus credits configured</p>
            <div className="ds-stat-value-row">
              <strong className="ds-stat-value">
                {totalAutomationCreditsGranted.toLocaleString("en-IN")}
              </strong>
              <span className="ds-stat-help">credits</span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="ds-alert error ds-admin-page-error">{error}</div>}

      <section className="ds-dashboard-panel ds-admin-form-panel" ref={couponFormRef}>
        <div className="ds-dashboard-panel-header">
          <div>
            <p className="ds-dashboard-panel-title">
              {editingCouponId ? "Edit coupon" : "Create coupon"}
            </p>
            <h2 className="ds-admin-panel-heading">
              {editingCouponId ? "Update commercial rule." : "Create a new offer rule."}
            </h2>
          </div>

          <span className="ds-admin-panel-pill">{editingCouponId ? "Editing" : "New"}</span>
        </div>

        <div className="ds-dashboard-panel-body">
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
        </div>
      </section>

      <section className="ds-dashboard-panel ds-admin-coupon-panel">
        <div className="ds-dashboard-panel-header">
          <div>
            <p className="ds-dashboard-panel-title">Coupon manager</p>
            <h2 className="ds-admin-panel-heading">Monitor and control existing coupons.</h2>
          </div>

          <span className="ds-admin-panel-pill">
            {isLoading ? "Syncing..." : `${coupons.length} records`}
          </span>
        </div>

        <div className="ds-dashboard-panel-body">
          <AdminCouponList
            coupons={coupons}
            isLoading={isLoading}
            onEditCoupon={handleEditCoupon}
            onChangeStatus={onChangeCouponStatus}
          />
        </div>
      </section>
    </main>
  );
}

export default AdminPage;
