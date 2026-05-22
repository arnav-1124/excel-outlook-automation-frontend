import React from "react";

function getAccountLabel({ isAuthenticated, user, usage }) {
  if (isAuthenticated && user?.fullName) {
    return user.fullName;
  }

  if (isAuthenticated && user?.email) {
    return user.email;
  }

  if (usage?.accountType === "USER") {
    return "Signed-in account";
  }

  return "Guest mode";
}

function getPlanLabel({ usage, isAuthenticated }) {
  if (usage?.currentPlan?.name) {
    return usage.currentPlan.name;
  }

  if (usage?.subscription?.plan?.name) {
    return usage.subscription.plan.name;
  }

  return isAuthenticated ? "Free account" : "Limited access";
}

function CreditsBadge({ usage, isAuthenticated, user, isLoading, onRefresh }) {
  const creditsRemaining = usage?.creditsRemaining ?? 0;
  const totalCreditsGranted = usage?.totalCreditsGranted ?? 0;
  const creditsUsed = usage?.creditsUsed ?? 0;

  const progressPercent =
    totalCreditsGranted > 0
      ? Math.min(100, Math.round((creditsUsed / totalCreditsGranted) * 100))
      : 0;

  const accountLabel = getAccountLabel({
    isAuthenticated,
    user,
    usage,
  });

  const planLabel = getPlanLabel({
    usage,
    isAuthenticated,
  });

  return (
    <section className="credits-badge-card">
      <div className="credits-badge-top">
        <div className="credits-badge-left">
          <div className="credits-icon">◆</div>

          <div>
            <p className="credits-kicker">Automation credits</p>
            <h3 className="credits-title">
              {isLoading ? "Syncing credits..." : `${creditsRemaining} left`}
            </h3>
          </div>
        </div>

        <button className="credits-refresh-btn" onClick={onRefresh} title="Refresh credits">
          ↻
        </button>
      </div>

      <div className="credits-progress-track">
        <div className="credits-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="credits-badge-meta">
        <span>{accountLabel}</span>
        <span>{planLabel}</span>
      </div>

      <p className="credits-footnote">
        {totalCreditsGranted > 0
          ? `${creditsUsed} used out of ${totalCreditsGranted} credits.`
          : "Credits will appear after usage sync."}
      </p>
    </section>
  );
}

export default CreditsBadge;
