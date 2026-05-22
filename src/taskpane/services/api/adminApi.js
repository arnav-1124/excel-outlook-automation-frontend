import { apiRequest } from "./apiClient";

export async function getAdminCoupons() {
  const response = await apiRequest("/coupons/admin", {
    method: "GET",
  });

  return response.data;
}

export async function createAdminCoupon(payload) {
  const response = await apiRequest("/coupons/admin", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function updateAdminCoupon(id, payload) {
  const response = await apiRequest(`/coupons/admin/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return response.data;
}