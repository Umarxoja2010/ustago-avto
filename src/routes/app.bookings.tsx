import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, CalendarX2, CheckCircle2, Circle, Clock, Car } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { EmptyState } from "@/components/customer/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toUiBooking } from "@/lib/api-adapters";
import { ApiError } from "@/lib/api-client";
import { formatSom, type BookingState, type CustomerBooking } from "@/lib/customer-data";
import { useDataText } from "@/lib/data-i18n";
import {
  useBookings,
  useRescheduleBooking,
  useUpdateBookingStatus,
} from "@/lib/hooks/use-bookings";
import i18n from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/bookings")({
  head: () => ({
    meta: [
      { title: i18n.t("customer:head.bookings.title") },
      {
        name: "description",
        content: i18n.t("customer:head.bookings.description"),
      },
      { property: "og:title", content: i18n.t("customer:head.bookings.title") },
      { property: "og:description", content: i18n.t("customer:head.bookings.ogDescription") },
    ],
  }),
  component: BookingsScreen,
});

const slots = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

function StateBadge({ state }: { state: BookingState }) {
  const { t } = useTranslation("customer");
  const map = {
    upcoming: "bg-primary/10 text-primary",
    completed: "bg-success/10 text-success",
    cancelled: "bg-destructive/10 text-destructive",
  } as const;
  return (
    <span
      className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize", map[state])}
    >
      {t(`bookings.state.${state}`)}
    </span>
  );
}

function BookingsScreen() {
  const { t } = useTranslation("customer");
  const td = useDataText();
  const { data: apiBookings } = useBookings();
  const bookings = (apiBookings?.items ?? []).map(toUiBooking);
  const updateStatus = useUpdateBookingStatus();
  const reschedule = useRescheduleBooking();
  const [detail, setDetail] = useState<CustomerBooking | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<CustomerBooking | null>(null);

  const groups: Record<BookingState, CustomerBooking[]> = {
    upcoming: bookings.filter((b) => b.state === "upcoming"),
    completed: bookings.filter((b) => b.state === "completed"),
    cancelled: bookings.filter((b) => b.state === "cancelled"),
  };

  return (
    <div className="space-y-5 pb-6">
      <header className="rounded-b-[2rem] bg-card px-5 pb-5 pt-8 card-elevated">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("bookings.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("bookings.subtitle")}</p>
      </header>

      <Tabs defaultValue="upcoming" className="px-5">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl">
          <TabsTrigger value="upcoming" className="rounded-xl text-xs">
            {t("bookings.tabs.upcoming")}
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-xl text-xs">
            {t("bookings.tabs.completed")}
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-xl text-xs">
            {t("bookings.tabs.cancelled")}
          </TabsTrigger>
        </TabsList>

        {(Object.keys(groups) as BookingState[]).map((state) => (
          <TabsContent key={state} value={state} className="mt-4 space-y-3">
            {groups[state].length === 0 ? (
              <EmptyState
                icon={state === "cancelled" ? CalendarX2 : CalendarClock}
                title={t("bookings.noBookings.title", { state: t(`bookings.state.${state}`) })}
                description={
                  state === "upcoming"
                    ? t("bookings.noBookings.upcomingDescription")
                    : t("bookings.noBookings.genericDescription", {
                        state: t(`bookings.state.${state}`),
                      })
                }
              />
            ) : (
              groups[state].map((b) => (
                <article
                  key={b.id}
                  className="space-y-3 rounded-3xl border border-border/70 bg-card p-4 card-elevated"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-[15px] font-semibold text-foreground">
                        {td(b.service)}
                      </h2>
                      <p className="truncate text-sm text-muted-foreground">{b.mechanic}</p>
                    </div>
                    <StateBadge state={b.state} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {td(b.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {td(b.time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Car className="h-3.5 w-3.5" />
                      {b.vehicle}
                    </span>
                  </div>
                  <div className="flex items-center justify-end border-t border-border/70 pt-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full"
                        onClick={() => setDetail(b)}
                      >
                        {t("bookings.details")}
                      </Button>
                      {b.state === "upcoming" ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => setRescheduleFor(b)}
                          >
                            {t("bookings.reschedule")}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full text-destructive"
                            onClick={() => setCancelId(b.id)}
                          >
                            {t("bookings.cancel")}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Drawer open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DrawerContent className="mx-auto max-w-[430px] rounded-t-3xl">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-xl">
              {detail?.service ? td(detail.service) : ""}
            </DrawerTitle>
          </DrawerHeader>
          {detail ? (
            <div className="space-y-6 p-4 pb-8">
              <div className="space-y-2 rounded-2xl bg-muted/60 p-4 text-sm">
                {[
                  [t("bookings.detail.bookingId"), detail.id],
                  [t("bookings.detail.workshop"), detail.mechanic],
                  [t("bookings.detail.date"), `${td(detail.date)} · ${td(detail.time)}`],
                  [t("bookings.detail.vehicle"), detail.vehicle],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-right font-medium text-foreground">{v}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <p className="text-sm font-semibold text-foreground">
                  {t("bookings.detail.statusTimeline")}
                </p>
                {detail.timeline.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {item.done ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/40" />
                      )}
                      {i < detail.timeline.length - 1 ? (
                        <span
                          className={cn("mt-1 h-8 w-px", item.done ? "bg-primary/40" : "bg-border")}
                        />
                      ) : null}
                    </div>
                    <div className="pb-1">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          item.done ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {td(item.label)}
                      </p>
                      <p className="text-xs text-muted-foreground">{td(item.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>

      <Drawer open={!!rescheduleFor} onOpenChange={(o) => !o && setRescheduleFor(null)}>
        <DrawerContent className="mx-auto max-w-[430px] rounded-t-3xl">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-xl">{t("bookings.rescheduleTitle")}</DrawerTitle>
          </DrawerHeader>
          <div className="grid grid-cols-3 gap-2 p-4 pb-8">
            {slots.map((s) => (
              <Button
                key={s}
                variant="outline"
                className="h-12 rounded-2xl"
                disabled={reschedule.isPending}
                onClick={() => {
                  if (rescheduleFor) {
                    reschedule.mutate(
                      { id: Number(rescheduleFor.id), date: rescheduleFor.date, time: s },
                      {
                        onSuccess: () =>
                          toast.success(t("bookings.rescheduleSuccess", { time: s })),
                        onError: (err) =>
                          toast.error(
                            err instanceof ApiError
                              ? t(err.message, { defaultValue: err.message })
                              : t("bookings.cancel"),
                          ),
                      },
                    );
                  }
                  setRescheduleFor(null);
                }}
              >
                {s}
              </Button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={!!cancelId} onOpenChange={(o) => !o && setCancelId(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("bookings.cancelDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("bookings.cancelDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              {t("bookings.cancelDialog.keep")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full"
              onClick={() => {
                if (cancelId) {
                  updateStatus.mutate(
                    { id: Number(cancelId), status: "cancelled" },
                    {
                      onSuccess: () => toast.success(t("bookings.cancelSuccess")),
                      onError: () => toast.error(t("bookings.cancelDialog.title")),
                    },
                  );
                }
                setCancelId(null);
              }}
            >
              {t("bookings.cancelDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
