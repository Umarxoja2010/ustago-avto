import { useMemo } from "react";
import { useAuth } from "@/lib/auth";

export interface AdminUser {
  name: string;
  email: string;
  role: string;
}

/**
 * Compatibility layer so existing admin screens keep working on top of the
 * unified auth store.
 */
export function useAdminAuth() {
  const { user, ready, signOut } = useAuth();

  const admin = useMemo<AdminUser | null>(
    () =>
      user && user.role === "admin"
        ? { name: user.name, email: user.email || "", role: "Super Admin" }
        : null,
    [user],
  );

  return { admin, ready, signOut };
}
