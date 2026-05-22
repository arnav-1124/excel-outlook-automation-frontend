import { apiRequest } from "./apiClient";

export async function previewSubscription({ planCode, couponCode }) {
  const response = await apiRequest("/subscriptions/preview", {
    method: "POST",
    body: JSON.stringify({
      planCode,
      couponCode,
    }),
  });

  return response.data;
}
