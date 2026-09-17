import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { roleHome, useAuth, type Role } from "@/lib/auth";

/**
 * Redirects to the login page when signed out, or to the user's own panel
 * when their role does not match the protected area.
 */
export function useRoleGuard(role: Role) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (user.role !== role) navigate({ to: roleHome[user.role], replace: true });
  }, [ready, user, role, navigate]);

  return { user, allowed: ready && user?.role === role };
}
