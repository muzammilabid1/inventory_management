import { apiUrl } from "./api-url";

let refreshRequest: Promise<boolean> | null = null;

function refreshAccess(): Promise<boolean> {
  if (!refreshRequest) {
    refreshRequest = fetch(`${apiUrl}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.ok || response.status === 409)
      .catch(() => false)
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const request = () => fetch(`${apiUrl}${path}`, { ...init, credentials: "include" });
  const response = await request();
  if (response.status !== 401) return response;

  if (!(await refreshAccess())) {
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
    return response;
  }

  return request();
}
