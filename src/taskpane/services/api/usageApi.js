import { apiRequest, getGuestDeviceId, getAccessToken } from "./apiClient";

export async function initGuestUsage() {
  const guestDeviceId = getGuestDeviceId();

  const response = await apiRequest("/usage/guest/init", {
    method: "POST",
    body: JSON.stringify({
      guestDeviceId,
    }),
  });

  return response.data;
}

export async function getMyUsage() {
  const token = getAccessToken();

  const endpoint = token
    ? "/usage/me"
    : `/usage/me?guestDeviceId=${encodeURIComponent(getGuestDeviceId())}`;

  const response = await apiRequest(endpoint, {
    method: "GET",
  });

  return response.data;
}

export async function checkUsage({ creditsRequired = 1 } = {}) {
  const token = getAccessToken();

  const response = await apiRequest("/usage/check", {
    method: "POST",
    body: JSON.stringify({
      creditsRequired,
      ...(token ? {} : { guestDeviceId: getGuestDeviceId() }),
    }),
  });

  return response.data;
}

export async function consumeUsage({
  creditsToConsume = 1,
  source = "email_automation",
  description = "Email automation credit consumed.",
  metadata = {},
} = {}) {
  const token = getAccessToken();

  const response = await apiRequest("/usage/consume", {
    method: "POST",
    body: JSON.stringify({
      creditsToConsume,
      source,
      description,
      metadata,
      ...(token ? {} : { guestDeviceId: getGuestDeviceId() }),
    }),
  });

  return response.data;
}
