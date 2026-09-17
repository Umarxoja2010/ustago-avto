import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { useDataText } from "@/lib/data-i18n";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatSom } from "@/lib/mock-data";
import {
  useAdminBookings,
  useAdminMasters,
  useAdminRevenueReport,
  useAdminReportOverview,
  useAdminReviews,
  useAdminSignupsReport,
  useAdminUsers,
} from "@/lib/hooks/use-admin";

export const Route = createFileRoute("/_admin/dashboard")({
  head: () => ({
    meta: [
      { title: i18n.t("admin:dashboard.head.title") },
      { name: "description", content: i18n.t("admin:dashboard.head.description") },
      { property: "og:title", content: i18n.t("admin:dashboard.head.title") },
      { property: "og:description", content: i18n.t("admin:dashboard.head.ogDescription") },
    ],
  }),
  component: DashboardPage,
});

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: { to: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="card-elevated rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action ? (
          <Button asChild variant="ghost" size="sm" className="rounded-lg text-primary">
            <Link to={action.to}>{action.label}</Link>
          </Button>
        ) : null}
      </div>
      <div className="p-2">{children}</div>
    </section>
  );
}

function DashboardPage() {
  const { t } = useTranslation("admin");
  const td = useDataText();
  const { data: overview } = useAdminReportOverview();
  const { data: signups } = useAdminSignupsReport(30);
  const { data: revenue } = useAdminRevenueReport(30);
  const { data: recentUsers } = useAdminUsers({ perPage: 5 });
  const { data: recentBookings } = useAdminBookings({ perPage: 5 });
  const { data: recentReviews } = useAdminReviews({ perPage: 4 });
  const { data: pendingMasters } = useAdminMasters({ verificationStatus: "pending", perPage: 4 });

  const avgRating = (overview?.reviews.platformAverageRating ?? 0).toFixed(2);
  const revenueSeries = (revenue ?? []).map((d) => ({ date: d.date.slice(5), revenue: d.revenue }));
  const signupSeries = (signups ?? []).map((d) => ({
    date: d.date.slice(5),
    customer: d.customer,
    mechanic: d.mechanic,
  }));

  return (
    <>
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.description")}
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/reports">{t("dashboard.viewReports")}</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label={t("dashboard.stats.totalUsers")}
          value={overview?.users.total ?? 0}
          icon={Users}
          hint={t("dashboard.stats.platformWide")}
        />
        <StatCard
          label={t("dashboard.stats.totalMechanics")}
          value={overview?.masters.total ?? 0}
          icon={Wrench}
          hint={t("dashboard.stats.platformWide")}
        />
        <StatCard
          label={t("dashboard.stats.activeBookings")}
          value={
            (overview?.bookings.byStatus.pending ?? 0) + (overview?.bookings.byStatus.accepted ?? 0)
          }
          icon={CalendarDays}
          hint={t("dashboard.stats.inProgress")}
        />
        <StatCard
          label={t("dashboard.stats.completedBookings")}
          value={overview?.bookings.byStatus.completed ?? 0}
          icon={CheckCircle2}
          hint={t("dashboard.stats.allTime")}
        />
        <StatCard
          label={t("dashboard.stats.pendingApprovals")}
          value={overview?.masters.byVerificationStatus.pending ?? 0}
          icon={Clock}
          hint={t("dashboard.stats.workshopsWaiting")}
        />
        <StatCard
          label={t("dashboard.stats.averageRating")}
          value={avgRating}
          icon={Star}
          hint={t("dashboard.stats.platformWide")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card-elevated rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">{t("dashboard.panels.newRegistrations")}</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signupSeries}>
                <defs>
                  <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="customer"
                  stroke="var(--color-chart-1)"
                  fill="url(#gUsers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card-elevated rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">{t("dashboard.panels.bookingsPerMonth")}</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title={t("dashboard.panels.recentRegistrations")}
          action={{ to: "/users", label: t("dashboard.panels.allUsers") }}
        >
          <ul>
            {(recentUsers?.items ?? []).map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted"
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary-soft text-xs text-primary">
                    {u.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <StatusBadge status={u.status} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title={t("dashboard.panels.latestBookings")}
          action={{ to: "/bookings", label: t("dashboard.panels.allBookings") }}
        >
          <ul>
            {(recentBookings?.items ?? []).map((b) => (
              <li
                key={b.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <CalendarCheck className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {b.customer?.name} · {b.service?.name ? td(b.service.name) : ""}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {b.master?.workshopName} · {b.date}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium">{formatSom(b.price ?? 0)}</p>
                  <StatusBadge status={b.status} className="mt-1" />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title={t("dashboard.panels.newestReviews")}
          action={{ to: "/reviews", label: t("dashboard.panels.allReviews") }}
        >
          <ul>
            {(recentReviews?.items ?? []).map((r) => (
              <li key={r.id} className="rounded-xl px-3 py-2.5 hover:bg-muted">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">{r.customer?.name}</p>
                  <span className="flex shrink-0 items-center gap-1 text-sm text-warning">
                    <Star className="h-3.5 w-3.5 fill-current" /> {r.rating}.0
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {r.comment ? td(r.comment) : ""}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title={t("dashboard.panels.pendingMechanicRequests")}
          action={{ to: "/mechanics", label: t("dashboard.panels.review") }}
        >
          <ul>
            {(pendingMasters?.items ?? []).map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Wrench className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.workshopName}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.address}</p>
                </div>
                <StatusBadge status={m.verificationStatus} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
