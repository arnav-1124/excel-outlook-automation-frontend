import React, { useState } from "react";

function AccountPanel({
  user,
  isAuthenticated,
  isAccountLoading,
  usage,
  onLogin,
  onRegister,
  onLogout,
  onForgotPassword,
  onResetPassword,
  onRefreshUsage,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState(isAuthenticated ? "profile" : "login");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [forgotEmail, setForgotEmail] = useState("");
  const [resetForm, setResetForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  const creditsRemaining = usage?.creditsRemaining ?? 0;
  const totalCreditsGranted = usage?.totalCreditsGranted ?? 0;
  const creditsUsed = usage?.creditsUsed ?? 0;

  const accountTitle = isAuthenticated
    ? user?.fullName || user?.email || "Signed-in account"
    : "Account & sign in";

  async function handleLoginSubmit(event) {
    event.preventDefault();

    await onLogin(loginForm);
    await onRefreshUsage();

    setMode("profile");
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();

    await onRegister(registerForm);
    await onRefreshUsage();

    setMode("profile");
  }

  async function handleForgotSubmit(event) {
    event.preventDefault();

    await onForgotPassword({
      email: forgotEmail,
    });

    setResetForm((current) => ({
      ...current,
      email: forgotEmail,
    }));

    setMode("reset");
  }

  async function handleResetSubmit(event) {
    event.preventDefault();

    await onResetPassword(resetForm);

    setMode("login");
  }

  async function handleLogoutClick() {
    onLogout();
    await onRefreshUsage();
    setMode("login");
  }

  return (
    <section className={`account-panel ${isExpanded ? "expanded" : "collapsed"}`}>
      <button
        className="account-panel-toggle"
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
      >
        <div className="account-toggle-left">
          <div className="account-toggle-icon">⚙</div>

          <div>
            <p className="account-kicker">Account</p>
            <h2 className="account-title">{accountTitle}</h2>
          </div>
        </div>

        <div className="account-toggle-right">
          <span className={`account-status-pill ${isAuthenticated ? "signed-in" : "guest"}`}>
            {isAuthenticated ? "Connected" : "Guest"}
          </span>

          <span className={`account-collapse-icon ${isExpanded ? "open" : ""}`} />
        </div>
      </button>

      {!isExpanded && (
        <div className="account-mini-summary">
          <span>{creditsRemaining} credits left</span>
          <span>{isAuthenticated ? "Free account" : "Guest access"}</span>
        </div>
      )}

      {isExpanded && (
        <>
          {isAuthenticated && (
            <div className="account-profile-card">
              <div className="account-avatar">
                {(user?.fullName || user?.email || "U").slice(0, 1).toUpperCase()}
              </div>

              <div className="account-profile-main">
                <div className="account-profile-name">{user?.fullName || "Signed-in user"}</div>
                <div className="account-profile-email">{user?.email}</div>
              </div>

              <button className="account-link-btn" onClick={handleLogoutClick}>
                Logout
              </button>
            </div>
          )}

          <div className="account-credit-card">
            <div>
              <p className="account-credit-label">Available credits</p>
              <h3 className="account-credit-value">{creditsRemaining}</h3>
            </div>

            <div className="account-credit-meta">
              <span>{creditsUsed} used</span>
              <span>{totalCreditsGranted} total</span>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="account-guest-note">
              Create an account to unlock 75 free automation credits and keep your usage connected
              to your email account.
            </div>
          )}

          {!isAuthenticated && (
            <div className="account-tabs">
              <button
                className={`account-tab ${mode === "login" ? "active" : ""}`}
                onClick={() => setMode("login")}
                type="button"
              >
                Login
              </button>

              <button
                className={`account-tab ${mode === "register" ? "active" : ""}`}
                onClick={() => setMode("register")}
                type="button"
              >
                Create Account
              </button>
            </div>
          )}

          {!isAuthenticated && mode === "login" && (
            <form className="account-form" onSubmit={handleLoginSubmit}>
              <label className="account-field">
                <span>Email</span>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="account-field">
                <span>Password</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Your password"
                  required
                />
              </label>

              <button className="account-primary-btn" disabled={isAccountLoading}>
                {isAccountLoading ? "Logging in..." : "Login"}
              </button>

              <button className="account-text-btn" type="button" onClick={() => setMode("forgot")}>
                Forgot password?
              </button>
            </form>
          )}

          {!isAuthenticated && mode === "register" && (
            <form className="account-form" onSubmit={handleRegisterSubmit}>
              <label className="account-field">
                <span>Name</span>
                <input
                  type="text"
                  value={registerForm.fullName}
                  onChange={(event) =>
                    setRegisterForm((current) => ({
                      ...current,
                      fullName: event.target.value,
                    }))
                  }
                  placeholder="Your name"
                />
              </label>

              <label className="account-field">
                <span>Email</span>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="account-field">
                <span>Password</span>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Minimum 8 characters"
                  required
                />
              </label>

              <button className="account-primary-btn" disabled={isAccountLoading}>
                {isAccountLoading ? "Creating..." : "Create Account"}
              </button>
            </form>
          )}

          {!isAuthenticated && mode === "forgot" && (
            <form className="account-form" onSubmit={handleForgotSubmit}>
              <div className="account-form-intro">
                Enter your email and we’ll send a password reset code.
              </div>

              <label className="account-field">
                <span>Email</span>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <button className="account-primary-btn" disabled={isAccountLoading}>
                {isAccountLoading ? "Sending..." : "Send Reset Code"}
              </button>

              <button className="account-text-btn" type="button" onClick={() => setMode("login")}>
                Back to login
              </button>
            </form>
          )}

          {!isAuthenticated && mode === "reset" && (
            <form className="account-form" onSubmit={handleResetSubmit}>
              <div className="account-form-intro">
                Enter the OTP sent to your email and set a new password.
              </div>

              <label className="account-field">
                <span>Email</span>
                <input
                  type="email"
                  value={resetForm.email}
                  onChange={(event) =>
                    setResetForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label className="account-field">
                <span>OTP</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={resetForm.otp}
                  onChange={(event) =>
                    setResetForm((current) => ({
                      ...current,
                      otp: event.target.value,
                    }))
                  }
                  placeholder="6-digit code"
                  required
                />
              </label>

              <label className="account-field">
                <span>New Password</span>
                <input
                  type="password"
                  value={resetForm.newPassword}
                  onChange={(event) =>
                    setResetForm((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                  placeholder="Minimum 8 characters"
                  required
                />
              </label>

              <button className="account-primary-btn" disabled={isAccountLoading}>
                {isAccountLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </>
      )}
    </section>
  );
}

export default AccountPanel;
