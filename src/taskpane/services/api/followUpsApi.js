import { apiRequest } from "./apiClient";

export async function createFollowUp(payload) {
  const response = await apiRequest("/followups", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function getFollowUps({ bucket = "all", status, search, limit = 50 } = {}) {
  const params = new URLSearchParams();

  if (bucket) params.set("bucket", bucket);
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  if (limit) params.set("limit", String(limit));

  const response = await apiRequest(`/followups?${params.toString()}`, {
    method: "GET",
  });

  return response.data;
}

export async function getFollowUpSummary() {
  const response = await apiRequest("/followups/summary", {
    method: "GET",
  });

  return response.data;
}

export async function updateFollowUp(id, payload) {
  const response = await apiRequest(`/followups/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function resolveFollowUp(id) {
  const response = await apiRequest(`/followups/${encodeURIComponent(id)}/resolve`, {
    method: "PATCH",
  });

  return response.data;
}

export async function snoozeFollowUp(id, payload) {
  const response = await apiRequest(`/followups/${encodeURIComponent(id)}/snooze`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function reopenFollowUp(id) {
  const response = await apiRequest(`/followups/${encodeURIComponent(id)}/reopen`, {
    method: "PATCH",
  });

  return response.data;
}

export async function cancelFollowUp(id) {
  const response = await apiRequest(`/followups/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  return response.data;
}
