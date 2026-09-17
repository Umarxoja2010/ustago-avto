import { Link } from "@tanstack/react-router";
import { Bell, CalendarCheck, LayoutGrid, User, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";

const tabs = [
  { to: "/mechanic", labelKey: "bottomNav.dashboard", icon: LayoutGrid, exact: true },
  { to: "/mechanic/jobs", labelKey: "bottomNav.jobs", icon: CalendarCheck },
  { to: "/mechanic/services", labelKey: "bottomNav.services", icon: Wrench },
  { to: "/mechanic/notifications", labelKey: "bottomNav.alerts", icon: Bell },
  { to: "/mechanic/profile", labelKey: "bottomNav.profile", icon: User },
] as const;

export function MechanicBottomNav() {
  const { t } = useTranslation("mechanic");
  return (
    <nav className="pointer-events-auto sticky bottom-0 z-30 border-t border-border/70 bg-card/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl shadow-nav">
      <ul className="grid grid-cols-5">
        {tabs.map(({ to, labelKey, icon: Icon, ...rest }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: "exact" in rest ? rest.exact : false }}
              className="group flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors data-[status=active]:text-primary"
            >
              <span className="grid h-8 w-12 place-items-center rounded-full transition-all duration-300 group-data-[status=active]:bg-primary/10">
                <Icon className="h-[19px] w-[19px] transition-transform duration-300 group-active:scale-90" />
              </span>
              {t(labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
