import { apiRequest } from "./apiClient";

export async function getMyNotificationPreference() {
  const response = await apiRequest("/notifications/preferences/me", {
    method: "GET",
  });

  return response.data;
}

export async function updateMyNotificationPreference(payload) {
  const response = await apiRequest("/notifications/preferences/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return response.data;
}
