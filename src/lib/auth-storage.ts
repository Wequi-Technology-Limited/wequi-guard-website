import type { AuthUser } from "@/types/auth";

export const AUTH_STORAGE_KEY = "wequiguard.auth";
export const AUTH_CHANGED_EVENT = "wequiguard.auth-changed";

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const emitAuthChanged = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export interface StoredAuthPayload {
  token: string;
  user: AuthUser;
  stored_at: string;
}

export const saveAuthPayload = (token: string, user: AuthUser) => {
  if (!isBrowser()) return;
  const payload: StoredAuthPayload = {
    token,
    user,
    stored_at: new Date().toISOString(),
  };
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  emitAuthChanged();
};

export const getStoredAuthPayload = (): StoredAuthPayload | null => {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuthPayload;
  } catch (error) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const getStoredAuthToken = () => getStoredAuthPayload()?.token;

export const clearStoredAuthPayload = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  emitAuthChanged();
};
