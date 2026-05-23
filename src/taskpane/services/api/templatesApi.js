import { apiRequest } from "./apiClient";

export async function getCloudTemplates({
  scope = "all",
  status = "ACTIVE",
  search = "",
  limit = 80,
} = {}) {
  const params = new URLSearchParams();

  if (scope) params.set("scope", scope);
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  if (limit) params.set("limit", String(limit));

  const response = await apiRequest(`/templates?${params.toString()}`, {
    method: "GET",
  });

  return response.data;
}