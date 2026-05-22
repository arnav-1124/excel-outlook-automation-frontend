import { apiRequest, saveAuthTokens, clearAuthTokens } from "./apiClient";

export async function registerUser({ email, password, fullName }) {
  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      fullName,
    }),
  });

  saveAuthTokens({
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  });

  return response.data;
}

export async function loginUser({ email, password }) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  saveAuthTokens({
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  });

  return response.data;
}

export async function getCurrentUser() {
  const response = await apiRequest("/auth/me", {
    method: "GET",
  });

  return response.data;
}

export async function forgotPassword({ email }) {
  const response = await apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });

  return response.data;
}

export async function resetPassword({ email, otp, newPassword }) {
  const response = await apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      email,
      otp,
      newPassword,
    }),
  });

  return response.data;
}

export function logoutUser() {
  clearAuthTokens();
}
