import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Search,
  Settings,
  Star,
  Tag,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BrandLogo } from "@/components/BrandLogo";
import { useAdminAuth } from "@/lib/admin-auth";
import { useDataText } from "@/lib/data-i18n";
import { notifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/users", labelKey: "nav.users", icon: Users },
  { to: "/mechanics", labelKey: "nav.mechanics", icon: Wrench },
  { to: "/offers", labelKey: "nav.offers", icon: Tag },
  { to: "/bookings", labelKey: "nav.bookings", icon: CalendarDays },
  { to: "/reviews", labelKey: "nav.reviews", icon: Star },
  { to: "/notifications", labelKey: "nav.notifications", icon: Megaphone },
  { to: "/reports", labelKey: "nav.reports", icon: BarChart3 },
  { to: "/settings", labelKey: "nav.settings", icon: Settings },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation(["admin", "common"]);
  const td = useDataText();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { admin, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/login", replace: true });
  };

  const SidebarBody = (
    <div className="flex h-full flex-col bg-[#071a32] text-white">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <BrandLogo size="sm" theme="dark" tagline={t("shell.panelName")} />
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto text-white hover:bg-white/10 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label={t("shell.closeMenu")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                  : "text-slate-300 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <span className="truncate">{t(`common:${item.labelKey}`)}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10"
        >
          <LogOut className="h-4 w-4" /> {t("shell.logout")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#0d284a] bg-[#071a32] lg:block">
        {SidebarBody}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-[#071a32] shadow-float">
            {SidebarBody}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label={t("shell.openMenu")}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative hidden min-w-0 flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("shell.searchPlaceholder")}
              className="max-w-sm rounded-xl pl-9"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <LanguageSwitcher compact />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label={t("shell.notificationsAria")}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 rounded-2xl p-0">
                <div className="border-b border-border px-4 py-3 text-sm font-semibold">
                  {t("shell.notifications")}
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <li key={n.id} className="border-b border-border px-4 py-3 last:border-0">
                      <p className="text-sm font-medium">{td(n.title)}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {td(n.message)}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{n.sentAt}</p>
                    </li>
                  ))}
                </ul>
                <div className="p-2">
                  <Button asChild variant="ghost" size="sm" className="w-full rounded-lg">
                    <Link to="/notifications">{t("shell.viewAll")}</Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      AO
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-left sm:block">
                    <span className="block text-sm font-medium leading-tight">
                      {admin?.name ?? t("shell.adminFallback")}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {t("shell.superAdmin")}
                    </span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="truncate">{admin?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" /> {t("common:nav.settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/notifications">
                    <Megaphone className="mr-2 h-4 w-4" /> {t("shell.announcements")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> {t("shell.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
