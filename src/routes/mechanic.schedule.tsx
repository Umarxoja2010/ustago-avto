import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { toMechanicJob } from "@/lib/api-adapters";
import { ApiError } from "@/lib/api-client";
import { useDataText } from "@/lib/data-i18n";
import { useBookings } from "@/lib/hooks/use-bookings";
import { useMasterWorkingHours, useUpdateMasterWorkingHours } from "@/lib/hooks/use-mechanic";
import { formatSom } from "@/lib/mechanic-data";

export const Route = createFileRoute("/mechanic/schedule")({
  component: ScheduleScreen,
});

const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function ScheduleScreen() {
  const { t } = useTranslation("mechanic");
  const td = useDataText();
  const { data: bookingsPage } = useBookings();
  const { data: apiHours } = useMasterWorkingHours();
  const updateHours = useUpdateMasterWorkingHours();

  const jobs = (bookingsPage?.items ?? []).map(toMechanicJob);
  const upcoming = jobs.filter((j) => j.state === "active" || j.state === "request");
  const byDate = upcoming.reduce<Record<string, typeof upcoming>>((acc, job) => {
    (acc[job.date] ??= []).push(job);
    return acc;
  }, {});

  const hours = (apiHours ?? [])
    .slice()
    .sort((a, b) => a.weekday - b.weekday)
    .map((h) => ({ ...h, dayLabel: WEEKDAY_LABELS[h.weekday] ?? String(h.weekday) }));

  const toggleDay = (weekday: number, nextOpen: boolean) => {
    if (!apiHours) return;
    const patched = apiHours.map((h) => (h.weekday === weekday ? { ...h, closed: !nextOpen } : h));
    updateHours.mutate(patched, {
      onSuccess: () =>
        toast.success(
          t("schedule.dayStatusToast", {
            day: t(`schedule.days.${WEEKDAY_LABELS[weekday]}`),
            status: nextOpen ? t("schedule.opened") : t("schedule.closed").toLowerCase(),
          }),
        ),
      onError: (err) =>
        toast.error(err instanceof ApiError ? t(err.message, { defaultValue: err.message }) : ""),
    });
  };

  return (
    <div className="space-y-5 pb-6">
      <header className="rounded-b-[2rem] bg-card px-5 pb-5 pt-8 card-elevated">
        <Link
          to="/mechanic"
          className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-transform active:scale-90"
          aria-label={t("common:actions.back")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("schedule.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("schedule.subtitle")}</p>
      </header>

      <section className="space-y-4 px-5">
        {Object.entries(byDate).map(([date, list]) => (
          <div key={date} className="space-y-2">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CalendarDays className="h-4 w-4 text-primary" /> {date}
            </p>
            {list
              .slice()
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((job) => (
                <div
                  key={job.id}
                  className="flex items-center gap-3 rounded-3xl border border-border/70 bg-card p-4 card-elevated"
                >
                  <span className="w-14 shrink-0 text-sm font-semibold text-primary">
                    {job.time}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-foreground">
                      {td(job.service)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {job.customer} · {job.vehicle}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-foreground">
                    {formatSom(job.price)}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </section>

      <section className="space-y-3 px-5">
        <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
          {t("schedule.workingHours")}
        </h2>
        <div className="divide-y divide-border/70 overflow-hidden rounded-3xl border border-border/70 bg-card card-elevated">
          {hours.map((h) => (
            <div key={h.weekday} className="flex items-center gap-3 px-4 py-3">
              <span className="w-24 text-sm font-medium text-foreground">
                {t(`schedule.days.${h.dayLabel}`)}
              </span>
              <span className="flex-1 text-sm text-muted-foreground">
                {h.closed || !h.open || !h.close ? t("schedule.closed") : `${h.open} – ${h.close}`}
              </span>
              <Switch
                checked={!h.closed}
                disabled={updateHours.isPending}
                onCheckedChange={(v) => toggleDay(h.weekday, v)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
