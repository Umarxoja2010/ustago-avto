import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { api, ApiError, clearToken, getToken, setToken } from "@/lib/api-client";
import { isDemoModeEnabled, getDemoUsers, getDemoMechanics } from "@/lib/demo-mode";

export type Role = "customer" | "mechanic" | "admin";

export interface UserPhone {
  id: number;
  phone: string;
  isPrimary: boolean;
  scheduledDeletionAt?: string | null;
  daysLeft?: number | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  phones?: UserPhone[];
  role: Role;
  avatar?: string | null;
  region?: string | null;
  city?: string | null;
  location?: string | null;
  /** Mechanic-only workshop information collected at registration. */
  workshop?: {
    name: string;
    address: string;
    city: string;
    experience: string;
    services: string;
    lat?: number | null;
    lng?: number | null;
  };
}

export const roleHome: Record<Role, string> = {
  customer: "/app",
  mechanic: "/mechanic",
  admin: "/dashboard",
};

export interface RegisterInput {
  role: Exclude<Role, "admin">;
  name: string;
  phone: string;
  email?: string;
  password: string;
  region?: string;
  city?: string;
  location?: string;
  workshop?: AuthUser["workshop"];
}

interface AuthValue {
  user: AuthUser | null;
  ready: boolean;
  signIn: (identifier: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  signOut: () => void;
  updateUser: (updated: Partial<AuthUser>) => void;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthValue | null>(null);

interface AuthResponse {
  user: AuthUser;
  token: string;
}

async function fetchMe(): Promise<AuthUser> {
  return api.get<AuthUser>("/user");
}

interface DemoUserRecord {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  avatar?: string | null;
  password?: string;
}

interface DemoMechanicRecord {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  avatar?: string | null;
  password?: string;
  workshop: {
    name: string;
    address: string;
    city: string;
    experience: string;
    services?: string;
  };
}

function findDemoUserByEmail(email: string): { user: AuthUser; password: string } | null {
  const users = getDemoUsers() as DemoUserRecord[];
  const user = users.find((u) => u.email === email);
  if (user) {
    return {
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: "customer" as const,
        avatar: user.avatar,
      },
      password: user.password ?? "demo1234",
    };
  }

  const mechanics = getDemoMechanics() as DemoMechanicRecord[];
  const mechanic = mechanics.find((m) => m.email === email);
  if (mechanic) {
    return {
      user: {
        id: String(mechanic.id),
        name: mechanic.name,
        email: mechanic.email,
        phone: mechanic.phone,
        role: "mechanic" as const,
        avatar: mechanic.avatar,
        workshop: {
          name: mechanic.workshop.name,
          address: mechanic.workshop.address,
          city: mechanic.workshop.city,
          experience: mechanic.workshop.experience,
          services: mechanic.workshop.services ?? "",
        },
      },
      password: mechanic.password ?? "demo1234",
    };
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!getToken()) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const me = await fetchMe();
        if (!cancelled) setUser(me);
      } catch {
        // token invalid/expired — the underlying request() in api-client.ts
        // already clears it on a 401
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      ready,
      signIn: async (identifier, password) => {
        // Check demo mode first
        if (isDemoModeEnabled()) {
          const demoUserData = findDemoUserByEmail(identifier);
          if (demoUserData && demoUserData.password === password) {
            const user = demoUserData.user;
            // Set a fake token for demo mode
            setToken(`demo-token-${user.id}`);
            setUser(user);
            return user;
          }
        }

        // Fall back to real API
        try {
          const res = await api.post<AuthResponse>("/auth/login", { identifier, password }, true);
          setToken(res.token);
          setUser(res.user);
          return res.user;
        } catch (error) {
          // Check demo mode as fallback
          if (isDemoModeEnabled()) {
            const demoUserData = findDemoUserByEmail(identifier);
            if (demoUserData && demoUserData.password === password) {
              const user = demoUserData.user;
              setToken(`demo-token-${user.id}`);
              setUser(user);
              return user;
            }
          }
          throw error;
        }
      },
      register: async (input) => {
        const payload =
          input.role === "mechanic"
            ? {
                role: input.role,
                name: input.name,
                phone: input.phone,
                email: input.email || undefined,
                password: input.password,
                password_confirmation: input.password,
                region: input.region || undefined,
                city: input.city || undefined,
                workshop: input.workshop
                  ? {
                      name: input.workshop.name,
                      address: input.workshop.address,
                      city: input.city || input.workshop.city,
                      district: undefined,
                      lat: undefined,
                      lng: undefined,
                      experience: input.workshop.experience
                        ? Number(input.workshop.experience)
                        : undefined,
                      services: input.workshop.services,
                    }
                  : undefined,
              }
            : {
                role: input.role,
                name: input.name,
                phone: input.phone,
                email: input.email || undefined,
                password: input.password,
                password_confirmation: input.password,
                region: input.region || undefined,
                city: input.city || undefined,
              };

        const res = await api.post<AuthResponse>("/auth/register", payload, true);
        setToken(res.token);
        setUser(res.user);
        return res.user;
      },
      signOut: () => {
        // Best-effort — even if the network call fails, clear local state
        // immediately so the UI never feels stuck signed-in.
        void api.post("/auth/logout").catch(() => undefined);
        clearToken();
        setUser(null);
      },
      updateUser: (updated: Partial<AuthUser>) => {
        setUser((prev) => (prev ? { ...prev, ...updated } : null));
      },
      refreshUser: async () => {
        try {
          const fresh = await fetchMe();
          setUser(fresh);
          return fresh;
        } catch {
          return null;
        }
      },
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export { ApiError };
