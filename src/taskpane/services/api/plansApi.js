import { apiRequest } from "./apiClient";

export async function getPlans() {
  const response = await apiRequest("/plans", {
    method: "GET",
  });

  return response.data;
}

export async function getPlanByCode(code) {
  const response = await apiRequest(`/plans/${encodeURIComponent(code)}`, {
    method: "GET",
  });

  return response.data;
}
