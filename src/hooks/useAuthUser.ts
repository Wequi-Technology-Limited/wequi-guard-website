import { useCallback, useEffect, useState } from "react";

import { AUTH_CHANGED_EVENT, getStoredAuthPayload, type StoredAuthPayload } from "@/lib/auth-storage";
import { authService } from "@/services/auth-service";

const isBrowser = () => typeof window !== "undefined";

export const useAuthUser = () => {
  const [payload, setPayload] = useState<StoredAuthPayload | null>(() => getStoredAuthPayload());

  const refresh = useCallback(() => {
    setPayload(getStoredAuthPayload());
  }, []);

  useEffect(() => {
    if (!isBrowser()) return;
    const handle = () => refresh();
    window.addEventListener(AUTH_CHANGED_EVENT, handle);
    window.addEventListener("storage", handle);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handle);
      window.removeEventListener("storage", handle);
    };
  }, [refresh]);

  const logout = useCallback(() => {
    authService.logout();
    refresh();
  }, [refresh]);

  return {
    user: payload?.user ?? null,
    token: payload?.token ?? null,
    refresh,
    logout,
  };
};
