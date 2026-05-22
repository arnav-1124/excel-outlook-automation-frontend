import { useEffect, useState } from "react";

import { getAccessToken, clearAuthTokens } from "../services/api/apiClient";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  forgotPassword,
  resetPassword,
} from "../services/api/authApi";

function useAccount({ showToast, showBanner, addActivity }) {
  const [user, setUser] = useState(null);
  const [isAccountLoading, setIsAccountLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAccessToken()));

  async function loadCurrentUser() {
    const token = getAccessToken();

    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }

    try {
      setIsAccountLoading(true);

      const currentUser = await getCurrentUser();

      setUser(currentUser);
      setIsAuthenticated(true);

      return currentUser;
    } catch (error) {
      console.error("Load current user failed:", error);

      clearAuthTokens();
      setUser(null);
      setIsAuthenticated(false);

      return null;
    } finally {
      setIsAccountLoading(false);
    }
  }

  async function login({ email, password }) {
    try {
      setIsAccountLoading(true);

      const result = await loginUser({ email, password });

      setUser(result.user);
      setIsAuthenticated(true);

      showToast("success", "Logged in", "Your account is connected.");
      addActivity("success", `Logged in as ${result.user.email}`);

      return result;
    } catch (error) {
      showBanner("error", error.message || "Could not login.");
      throw error;
    } finally {
      setIsAccountLoading(false);
    }
  }

  async function register({ email, password, fullName }) {
    try {
      setIsAccountLoading(true);

      const result = await registerUser({ email, password, fullName });

      setUser(result.user);
      setIsAuthenticated(true);

      showToast("success", "Account created", "Your free credits are ready.");
      addActivity("success", `Account created for ${result.user.email}`);

      return result;
    } catch (error) {
      showBanner("error", error.message || "Could not create account.");
      throw error;
    } finally {
      setIsAccountLoading(false);
    }
  }

  function logout() {
    logoutUser();

    setUser(null);
    setIsAuthenticated(false);

    showToast("success", "Logged out", "You are now using guest mode.");
    addActivity("success", "Logged out.");
  }

  async function sendForgotPasswordOtp({ email }) {
    try {
      setIsAccountLoading(true);

      const result = await forgotPassword({ email });

      showToast("success", "Reset code sent", "If the email exists, a reset code has been sent.");

      return result;
    } catch (error) {
      showBanner("error", error.message || "Could not send reset code.");
      throw error;
    } finally {
      setIsAccountLoading(false);
    }
  }

  async function resetPasswordWithOtp({ email, otp, newPassword }) {
    try {
      setIsAccountLoading(true);

      const result = await resetPassword({ email, otp, newPassword });

      showToast("success", "Password reset", "You can now login with your new password.");
      addActivity("success", "Password reset completed.");

      return result;
    } catch (error) {
      showBanner("error", error.message || "Could not reset password.");
      throw error;
    } finally {
      setIsAccountLoading(false);
    }
  }

  useEffect(() => {
    loadCurrentUser();
  }, []);

  return {
    user,
    isAuthenticated,
    isAccountLoading,

    loadCurrentUser,
    login,
    register,
    logout,
    sendForgotPasswordOtp,
    resetPasswordWithOtp,
  };
}

export default useAccount;
