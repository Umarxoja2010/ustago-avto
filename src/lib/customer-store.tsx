import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const KEY = "ustago.customer.prefs.v1";

/**
 * Local-only UI preferences with no backend equivalent: which quick-service
 * shortcuts the customer pinned on the home screen, dark mode, and language.
 * Vehicles, bookings, and favorite workshops now live in React Query
 * (see src/lib/hooks/) since they're real server data — see
 * use-vehicles.ts, use-bookings.ts, use-favorites.ts.
 */
interface Persisted {
  favoriteServices: string[];
  darkMode: boolean;
  language: string;
}

const defaults: Persisted = {
  favoriteServices: ["oil", "diagnostics"],
  darkMode: false,
  language: "English",
};

interface Store extends Persisted {
  toggleService: (id: string) => void;
  setDarkMode: (v: boolean) => void;
  setLanguage: (v: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function CustomerStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(defaults);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...defaults, ...(JSON.parse(raw) as Persisted) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
    document.documentElement.classList.toggle("dark", state.darkMode);
  }, [state]);

  const patch = useCallback((fn: (p: Persisted) => Persisted) => setState(fn), []);

  const value = useMemo<Store>(
    () => ({
      ...state,
      toggleService: (id) =>
        patch((p) => ({
          ...p,
          favoriteServices: p.favoriteServices.includes(id)
            ? p.favoriteServices.filter((x) => x !== id)
            : [...p.favoriteServices, id],
        })),
      setDarkMode: (v) => patch((p) => ({ ...p, darkMode: v })),
      setLanguage: (v) => patch((p) => ({ ...p, language: v })),
    }),
    [state, patch],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCustomerStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCustomerStore must be used inside CustomerStoreProvider");
  return ctx;
}
