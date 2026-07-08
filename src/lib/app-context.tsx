import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ROLES, type Role, type RoleProfile } from "./mock-data";

type Theme = "light" | "dark";

interface AppState {
  user: RoleProfile | null;
  theme: Theme;
  sidebarCollapsed: boolean;
  login: (role: Role) => void;
  logout: () => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEY = "hov-hr-state";

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RoleProfile | null>(null);
  const [theme, setThemeState] = useState<Theme>("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.role && ROLES[s.role as Role]) setUser(ROLES[s.role as Role]);
        if (s.theme) setThemeState(s.theme);
        if (typeof s.sidebarCollapsed === "boolean") setSidebarCollapsed(s.sidebarCollapsed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ role: user?.role ?? null, theme, sidebarCollapsed })
    );
  }, [user, theme, sidebarCollapsed, hydrated]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const value: AppState = {
    user,
    theme,
    sidebarCollapsed,
    login: (role) => setUser(ROLES[role]),
    logout: () => setUser(null),
    setTheme: setThemeState,
    toggleTheme: () => setThemeState((t) => (t === "light" ? "dark" : "light")),
    toggleSidebar: () => setSidebarCollapsed((c) => !c),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
