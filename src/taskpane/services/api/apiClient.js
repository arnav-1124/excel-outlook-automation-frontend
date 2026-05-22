const API_BASE_URL =
  typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL
    ? process.env.REACT_APP_API_BASE_URL
    : "http://localhost:5000/api";

const ACCESS_TOKEN_KEY = "excel_outlook_access_token";
const REFRESH_TOKEN_KEY = "excel_outlook_refresh_token";
const GUEST_DEVICE_ID_KEY = "excel_outlook_guest_device_id";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveAuthTokens({ accessToken, refreshToken }) {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getGuestDeviceId() {
  let guestDeviceId = localStorage.getItem(GUEST_DEVICE_ID_KEY);

  if (!guestDeviceId) {
    guestDeviceId = `guest_${crypto.randomUUID()}`;
    localStorage.setItem(GUEST_DEVICE_ID_KEY, guestDeviceId);
  }

  return guestDeviceId;
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || "API request failed.";

    const error = new Error(message);
    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}
