import React from "react";

const DISCOUNT_TYPES = [
  { value: "NONE", label: "No discount" },
  { value: "PERCENTAGE", label: "Percentage discount" },
  { value: "FIXED_AMOUNT", label: "Fixed amount discount" },
];

const COUPON_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "EXPIRED", label: "Expired" },
];

function togglePlanCode(currentCodes, planCode) {
  if (currentCodes.includes(planCode)) {
    return currentCodes.filter((code) => code !== planCode);
  }

  return [...currentCodes, planCode];
}

function AdminCouponForm({
  form,
  setForm,
  editingCouponId,
  plans,
  isLoading,
  error,
  onSave,
  onCancel,
}) {
  const isEditing = Boolean(editingCouponId);

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <section className="admin-form-card">
      <div className="admin-form-header">
        <div>
          <p className="admin-section-kicker">{isEditing ? "Edit coupon" : "Create coupon"}</p>
          <h3>{isEditing ? "Update coupon rules" : "Create a new offer"}</h3>
        </div>

        {isEditing && (
          <button className="admin-secondary-btn compact" type="button" onClick={onCancel}>
            Cancel edit
          </button>
        )}
      </div>

      {error && <div className="admin-local-error">{error}</div>}

      <div className="admin-form-grid">
        <label className="account-field">
          <span>Coupon code</span>
          <input
            type="text"
            value={form.code}
            onChange={(event) => updateField("code", event.target.value.toUpperCase())}
            placeholder="WELCOME50"
          />
        </label>

        <label className="account-field">
          <span>Status</span>
          <select
            className="admin-select"
            value={form.status}
            onChange={(event) => updateField("status", event.target.value)}
          >
            {COUPON_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="account-field">
        <span>Description</span>
        <input
          type="text"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="50% off plus bonus credits"
        />
      </label>

      <div className="admin-form-grid">
        <label className="account-field">
          <span>Discount type</span>
          <select
            className="admin-select"
            value={form.discountType}
            onChange={(event) => updateField("discountType", event.target.value)}
          >
            {DISCOUNT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="account-field">
          <span>
            {form.discountType === "PERCENTAGE"
              ? "Discount %"
              : form.discountType === "FIXED_AMOUNT"
                ? "Amount in paise"
                : "Discount value"}
          </span>
          <input
            type="number"
            min="0"
            value={form.discountValue}
            onChange={(event) => updateField("discountValue", event.target.value)}
            disabled={form.discountType === "NONE"}
            placeholder="50"
          />
        </label>
      </div>

      <div className="admin-form-grid">
        <label className="account-field">
          <span>Extra automation credits</span>
          <input
            type="number"
            min="0"
            value={form.extraAutomationCredits}
            onChange={(event) => updateField("extraAutomationCredits", event.target.value)}
          />
        </label>

        <label className="account-field">
          <span>Extra AI credits</span>
          <input
            type="number"
            min="0"
            value={form.extraAiCredits}
            onChange={(event) => updateField("extraAiCredits", event.target.value)}
          />
        </label>
      </div>

      <div className="admin-form-grid">
        <label className="account-field">
          <span>Total usage limit</span>
          <input
            type="number"
            min="1"
            value={form.maxTotalRedemptions}
            onChange={(event) => updateField("maxTotalRedemptions", event.target.value)}
            placeholder="Leave blank for unlimited"
          />
        </label>

        <label className="account-field">
          <span>Uses per user</span>
          <input
            type="number"
            min="1"
            value={form.maxRedemptionsPerUser}
            onChange={(event) => updateField("maxRedemptionsPerUser", event.target.value)}
          />
        </label>
      </div>

      <div className="admin-plan-selector">
        <div className="admin-plan-selector-header">
          <span>Allowed plans</span>
          <small>Leave all unchecked to allow every plan.</small>
        </div>

        <div className="admin-plan-chip-grid">
          {plans.map((plan) => {
            const selected = form.allowedPlanCodes.includes(plan.code);

            return (
              <button
                key={plan.id}
                type="button"
                className={`admin-plan-chip ${selected ? "selected" : ""}`}
                onClick={() =>
                  updateField("allowedPlanCodes", togglePlanCode(form.allowedPlanCodes, plan.code))
                }
              >
                {plan.name}
              </button>
            );
          })}
        </div>
      </div>

      <button className="admin-primary-btn" type="button" onClick={onSave} disabled={isLoading}>
        {isLoading ? "Saving..." : isEditing ? "Save coupon changes" : "Create coupon"}
      </button>
    </section>
  );
}

export default AdminCouponForm;
