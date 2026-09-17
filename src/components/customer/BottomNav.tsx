import { Link } from "@tanstack/react-router";
import { CalendarDays, Heart, Home, Search, User } from "lucide-react";
import { useTranslation } from "react-i18next";

const tabs = [
  { to: "/app", labelKey: "nav.home", icon: Home, exact: true },
  { to: "/app/search", labelKey: "nav.search", icon: Search },
  { to: "/app/bookings", labelKey: "nav.bookings", icon: CalendarDays },
  { to: "/app/favorites", labelKey: "nav.favorites", icon: Heart },
  { to: "/app/profile", labelKey: "nav.profile", icon: User },
] as const;

export function BottomNav() {
  const { t } = useTranslation("common");
  return (
    <nav className="pointer-events-auto fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-[430px] border-t border-border/70 bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl shadow-nav">
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
