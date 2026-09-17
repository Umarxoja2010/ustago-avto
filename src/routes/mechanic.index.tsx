import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CalendarDays, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PullToRefresh } from "@/components/customer/PullToRefresh";
import { SectionHeader } from "@/components/customer/SectionHeader";
import { JobCard } from "@/components/mechanic/JobCard";
import { Switch } from "@/components/ui/switch";
import { toMechanicJob } from "@/lib/api-adapters";
import { ApiError } from "@/lib/api-client";
import { useBookings, useUpdateBookingStatus } from "@/lib/hooks/use-bookings";
import { useMasterProfile, useUpdateMasterProfile } from "@/lib/hooks/use-mechanic";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { toast } from "sonner";

export const Route = createFileRoute("/mechanic/")({
  component: MechanicDashboard,
});

function MechanicDashboard() {
  const { t } = useTranslation("mechanic");
  const { data: profile } = useMasterProfile();
  const updateProfile = useUpdateMasterProfile();
  const { data: bookingsPage, refetch: refetchBookings } = useBookings();
  const updateStatus = useUpdateBookingStatus();
  const { data: apiNotifications, refetch: refetchNotifications } = useNotifications();

  const jobs = (bookingsPage?.items ?? []).map(toMechanicJob);
  const unread = (apiNotifications ?? []).filter((n) => n.unread).length;
  const online = profile?.isOpen ?? true;

  const requests = jobs.filter((j) => j.state === "request");
  const active = jobs.filter((j) => j.state === "active");

  return (
    <PullToRefresh
      onRefresh={async () => {
        await Promise.all([refetchBookings(), refetchNotifications()]);
        toast.success(t("dashboard.updated"));
      }}
    >
      <div className="space-y-7 pb-6">
        <header className="space-y-5 rounded-b-[2rem] bg-card px-5 pb-6 pt-8 card-elevated">
          <div className="flex items-center gap-3">
            <img
              src={profile?.logo ?? ""}
              alt=""
              className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-foreground">
                {profile?.workshopName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{profile?.owner}</p>
            </div>
            <Link
              to="/mechanic/notifications"
              aria-label={t("common:nav.notifications")}
              className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted transition-transform active:scale-90"
            >
              <Bell className="h-5 w-5 text-foreground" />
              {unread > 0 ? (
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-card" />
              ) : null}
            </Link>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {online ? t("dashboard.acceptingJobs") : t("dashboard.notAcceptingJobs")}
              </p>
              <p className="text-xs text-muted-foreground">
                {online ? t("dashboard.acceptingHint") : t("dashboard.notAcceptingHint")}
              </p>
            </div>
            <Switch
              checked={online}
              disabled={updateProfile.isPending}
              onCheckedChange={(v) =>
                updateProfile.mutate(
                  { isOpen: v },
                  {
                    onError: (err) =>
                      toast.error(
                        err instanceof ApiError
                          ? t(err.message, { defaultValue: err.message })
                          : "",
                      ),
                  },
                )
              }
            />
          </div>
        </header>

        <section className="grid grid-cols-3 gap-3 px-5">
          {[
            {
              icon: CalendarDays,
              label: t("dashboard.stats.today"),
              value: `${active.length + requests.length}`,
            },
            {
              icon: Star,
              label: t("dashboard.stats.rating"),
              value: (profile?.rating ?? 0).toFixed(1),
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-3xl border border-border/70 bg-card p-3.5 text-center card-elevated"
            >
              <span className="mx-auto grid h-9 w-9 place-items-center rounded-2xl bg-primary/10 text-primary">
                <s.icon className="h-4.5 w-4.5" />
              </span>
              <p className="mt-2 text-lg font-semibold text-foreground">{s.value}</p>
              <p className="text-[11px] leading-tight text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <SectionHeader
            title={t("dashboard.bookingRequests")}
            action={t("dashboard.seeAll")}
            to="/mechanic/jobs"
          />
          <div className="space-y-3 px-5">
            {requests.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
                {t("dashboard.noRequests")}
              </p>
            ) : (
              requests.slice(0, 2).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onAccept={() =>
                    updateStatus.mutate(
                      { id: Number(job.id), status: "accepted" },
                      {
                        onSuccess: () => toast.success(t("dashboard.jobAccepted")),
                        onError: (err) =>
                          toast.error(
                            err instanceof ApiError
                              ? t(err.message, { defaultValue: err.message })
                              : "",
                          ),
                      },
                    )
                  }
                  onReject={() =>
                    updateStatus.mutate(
                      { id: Number(job.id), status: "rejected" },
                      {
                        onSuccess: () => toast(t("dashboard.requestRejected")),
                        onError: (err) =>
                          toast.error(
                            err instanceof ApiError
                              ? t(err.message, { defaultValue: err.message })
                              : "",
                          ),
                      },
                    )
                  }
                />
              ))
            )}
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader
            title={t("dashboard.todaysJobs")}
            action={t("dashboard.schedule")}
            to="/mechanic/schedule"
          />
          <div className="space-y-3 px-5">
            {active.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
                {t("dashboard.noActiveJobs")}
              </p>
            ) : (
              active.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </div>
        </section>
      </div>
    </PullToRefresh>
  );
}
