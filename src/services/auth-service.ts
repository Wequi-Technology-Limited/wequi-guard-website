import { getAdminApiBaseUrl } from "@/lib/admin-api-client";
import { saveAuthPayload, clearStoredAuthPayload, getStoredAuthPayload } from "@/lib/auth-storage";
import type { AuthSession, LoginPayload, LoginResponse } from "@/types/auth";

const buildUrl = (path: string) => {
  const base = getAdminApiBaseUrl();
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
};

const login = async (payload: LoginPayload): Promise<AuthSession> => {
  const response = await fetch(buildUrl("/api/v1/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let payloadJson: LoginResponse | undefined;
  try {
    payloadJson = (await response.json()) as LoginResponse;
  } catch (error) {
    // ignore parsing error and handle below
  }

  if (!response.ok) {
    const backendMessage = payloadJson?.message;
    const message = backendMessage || (response.status === 401 ? "Invalid credentials" : "Unable to login");
    throw new Error(message);
  }

  if (!payloadJson?.data) {
    throw new Error("Unexpected response from server");
  }

  const session = payloadJson.data;
  const token = session.access_token || session.token;
  if (!token) {
    throw new Error("Missing access token in response");
  }

  saveAuthPayload(token, session.user, session.access_token);
  return session;
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
