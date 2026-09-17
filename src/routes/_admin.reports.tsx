import { createFileRoute } from "@tanstack/react-router";
import { Star, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { useDataText } from "@/lib/data-i18n";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { formatSom } from "@/lib/mock-data";
import {
  useAdminMasters,
  useAdminReportOverview,
  useAdminRevenueReport,
  useAdminSignupsReport,
  useAdminTopServices,
} from "@/lib/hooks/use-admin";

export const Route = createFileRoute("/_admin/reports")({
  head: () => ({
    meta: [
      { title: i18n.t("admin:reports.head.title") },
      { name: "description", content: i18n.t("admin:reports.head.description") },
      { property: "og:title", content: i18n.t("admin:reports.head.title") },
      { property: "og:description", content: i18n.t("admin:reports.head.ogDescription") },
    ],
  }),
  component: ReportsPage,
});

const pieColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-muted-foreground)",
];

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Aggregates a daily series (from the day-granularity report endpoints) into
 * the last 6 calendar months — the endpoints only return daily points, so
 * monthly buckets are built client-side rather than adding a third report
 * endpoint just for a different grouping of the same underlying data. */
function lastSixMonthBuckets<T extends { date: string }>(
  points: T[] | undefined,
  sum: (bucket: T[]) => Record<string, number>,
): Record<string, number>[] {
  const now = new Date();
  const buckets: Record<string, T[]> = {};
  for (const p of points ?? []) {
    const key = p.date.slice(0, 7); // YYYY-MM
    (buckets[key] ??= []).push(p);
  }

  const result: Record<string, number>[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({ monthIndex: d.getMonth(), ...sum(buckets[key] ?? []) });
  }
  return result;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-elevated rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-4 h-72">{children}</div>
    </section>
  );
}

function ReportsPage() {
  const { t } = useTranslation("admin");
  const td = useDataText();
  const { data: overview } = useAdminReportOverview();
  const { data: signups } = useAdminSignupsReport(180);
  const { data: revenue } = useAdminRevenueReport(180);
  const { data: topServices } = useAdminTopServices(6);
  const { data: mastersPage } = useAdminMasters({ perPage: 50 });

  const monthlySignups = lastSixMonthBuckets(signups, (b) => ({
    users: b.reduce((s, x) => s + x.customer + x.mechanic, 0),
  })).map((m) => ({ month: td(MONTH_LABELS[m.monthIndex]), users: m.users }));

  const monthlyBookings = lastSixMonthBuckets(revenue, (b) => ({
    bookings: b.reduce((s, x) => s + x.bookingsCount, 0),
  })).map((m) => ({ month: td(MONTH_LABELS[m.monthIndex]), bookings: m.bookings }));

  const monthlyRevenue = lastSixMonthBuckets(revenue, (b) => ({
    revenue: b.reduce((s, x) => s + x.revenue, 0),
  })).map((m) => ({ month: td(MONTH_LABELS[m.monthIndex]), revenue: m.revenue }));

  const popular = (topServices ?? []).map((s) => ({ service: td(s.name), count: s.bookingsCount }));

  const topMechanics = [...(mastersPage?.items ?? [])]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  const thisMonthBookings = monthlyBookings[monthlyBookings.length - 1]?.bookings ?? 0;
  const thisMonthUsers = monthlySignups[monthlySignups.length - 1]?.users ?? 0;

  return (
    <>
      <PageHeader title={t("reports.title")} description={t("reports.description")} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("reports.stats.totalRevenue")}
          value={formatSom(overview?.bookings.completedRevenue ?? 0)}
          icon={TrendingUp}
          hint={t("reports.stats.allTime")}
        />
        <StatCard
          label={t("reports.stats.bookingsThisMonth")}
          value={thisMonthBookings}
          icon={TrendingUp}
        />
        <StatCard
          label={t("reports.stats.newUsersThisMonth")}
          value={thisMonthUsers}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title={t("reports.charts.newUsersPerMonth")}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlySignups}>
              <defs>
                <linearGradient id="rUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="users"
                stroke="var(--color-chart-1)"
                fill="url(#rUsers)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t("reports.charts.bookingsPerMonth")}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyBookings}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="bookings" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t("reports.charts.revenueTrend")}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(v: number) => `${v / 1_000_000}M`}
              />
              <Tooltip formatter={(v: number) => formatSom(v)} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-chart-1)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t("reports.charts.popularServices")}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Pie
                data={popular}
                dataKey="count"
                nameKey="service"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {popular.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <section className="card-elevated rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4 text-sm font-semibold">
          {t("reports.topRatedMechanics")}
        </div>
        <ul className="divide-y divide-border">
          {topMechanics.map((m, i) => (
            <li key={m.id} className="flex items-center gap-3 px-5 py-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-sm font-semibold text-primary">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.workshopName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {m.owner?.name} · {t("reports.jobsCount", { count: m.jobsCount })}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-sm font-medium">
                <Star className="h-3.5 w-3.5 fill-current text-warning" /> {m.rating}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
