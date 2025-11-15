import { getAdminApiBaseUrl } from "@/lib/admin-api-client";
import { saveAuthPayload, clearStoredAuthPayload, getStoredAuthPayload } from "@/lib/auth-storage";
import type { AuthUser, LoginPayload, LoginResponse } from "@/types/auth";

const buildUrl = (path: string) => {
  const base = getAdminApiBaseUrl();
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
};

const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await fetch(buildUrl("/api/v1/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = response.status === 401 ? "Invalid credentials" : "Unable to login";
    throw new Error(message);
  }

  const data = (await response.json()) as LoginResponse;
  saveAuthPayload(data.token, data.user);
  return data;
};

const logout = () => {
  clearStoredAuthPayload();
};

const getCurrentUser = (): AuthUser | null => getStoredAuthPayload()?.user ?? null;

export const authService = {
  login,
  logout,
  getCurrentUser,
};
