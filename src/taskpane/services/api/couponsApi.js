import { apiRequest } from "./apiClient";

export async function validateCoupon({ code, planCode }) {
  const response = await apiRequest("/coupons/validate", {
    method: "POST",
    body: JSON.stringify({
      code,
      planCode,
    }),
  });

  return response.data;
}
