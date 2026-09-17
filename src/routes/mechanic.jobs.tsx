import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { JobCard } from "@/components/mechanic/JobCard";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toMechanicJob } from "@/lib/api-adapters";
import { ApiError } from "@/lib/api-client";
import { formatSom } from "@/lib/mechanic-data";
import { useBookings, useUpdateBookingStatus } from "@/lib/hooks/use-bookings";
import { useDataText } from "@/lib/data-i18n";
import type { MechanicJob } from "@/lib/mechanic-data";

export const Route = createFileRoute("/mechanic/jobs")({
  component: JobsScreen,
});

function JobsScreen() {
  const { t } = useTranslation("mechanic");
  const td = useDataText();
  const { data: bookingsPage } = useBookings();
  const updateStatus = useUpdateBookingStatus();
  const [open, setOpen] = useState<MechanicJob | null>(null);

  const jobs = (bookingsPage?.items ?? []).map(toMechanicJob);

  const groups = {
    request: jobs.filter((j) => j.state === "request"),
    active: jobs.filter((j) => j.state === "active"),
    completed: jobs.filter((j) => j.state === "completed"),
    rejected: jobs.filter((j) => j.state === "rejected"),
  };

  const onError = (err: unknown) =>
    toast.error(err instanceof ApiError ? t(err.message, { defaultValue: err.message }) : "");

  const detailRows = [
    [t("jobs.details.jobId"), open?.id],
    [t("jobs.details.dateTime"), `${open?.date} · ${open?.time}`],
    [t("jobs.details.address"), open?.address],
    [t("jobs.details.price"), open ? formatSom(open.price) : ""],
    [t("jobs.details.customerNote"), open?.note ? td(open.note) : t("jobs.details.none")],
  ];

  return (
    <div className="space-y-5 pb-6">
      <header className="rounded-b-[2rem] bg-card px-5 pb-5 pt-8 card-elevated">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("jobs.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("jobs.subtitle")}</p>
      </header>

      <Tabs defaultValue="request" className="px-5">
        <TabsList className="grid h-11 w-full grid-cols-4 rounded-2xl bg-muted p-1">
          <TabsTrigger value="request" className="rounded-xl text-xs">
            {t("jobs.tabs.new", { count: groups.request.length })}
          </TabsTrigger>
          <TabsTrigger value="active" className="rounded-xl text-xs">
            {t("jobs.tabs.active")}
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-xl text-xs">
            {t("jobs.tabs.done")}
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-xl text-xs">
            {t("jobs.tabs.rejected")}
          </TabsTrigger>
        </TabsList>

        {(["request", "active", "completed", "rejected"] as const).map((key) => (
          <TabsContent key={key} value={key} className="mt-4 space-y-3">
            {groups[key].length === 0 ? (
              <p className="rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
                {t("jobs.empty")}
              </p>
            ) : (
              groups[key].map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onOpen={() => setOpen(job)}
                  onAccept={
                    key === "request"
                      ? () =>
                          updateStatus.mutate(
                            { id: Number(job.id), status: "accepted" },
                            { onSuccess: () => toast.success(t("jobs.jobAccepted")), onError },
                          )
                      : undefined
                  }
                  onReject={
                    key === "request"
                      ? () =>
                          updateStatus.mutate(
                            { id: Number(job.id), status: "rejected" },
                            { onSuccess: () => toast(t("jobs.requestRejected")), onError },
                          )
                      : undefined
                  }
                  onComplete={
                    key === "active"
                      ? () =>
                          updateStatus.mutate(
                            { id: Number(job.id), status: "completed" },
                            { onSuccess: () => toast.success(t("jobs.jobCompleted")), onError },
                          )
                      : undefined
                  }
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Drawer open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DrawerContent className="mx-auto max-w-[430px] rounded-t-3xl">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-xl">{open?.service ? td(open.service) : ""}</DrawerTitle>
            <DrawerDescription>
              {open?.customer} · {open?.vehicle}
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-3 p-4 pb-8 text-sm">
            {detailRows.map(([label, value]) => (
              <div key={label as string} className="flex items-start justify-between gap-6">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-right font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
