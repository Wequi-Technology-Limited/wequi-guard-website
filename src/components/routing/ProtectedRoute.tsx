import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuthUser } from "@/hooks/useAuthUser";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
