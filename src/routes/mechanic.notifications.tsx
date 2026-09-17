import { createFileRoute } from "@tanstack/react-router";
import { Bell, CalendarCheck, Info, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "@/lib/api-adapters";
import { useDataText } from "@/lib/data-i18n";
import { useMarkNotificationRead, useNotifications } from "@/lib/hooks/use-notifications";
import type { ApiNotification } from "@/lib/api-types";

export const Route = createFileRoute("/mechanic/notifications")({
  component: NotificationsScreen,
});

type MechanicKind = "job" | "review" | "system";

const icons: Record<MechanicKind, typeof Bell> = {
  job: CalendarCheck,
  review: Star,
  system: Info,
};

// Backend `kind` is free-form ("booking", "announcement", admin-set
// strings...) — map what we recognize, default the rest to "system" rather
// than guessing.
function toMechanicKind(kind: string): MechanicKind {
  if (kind === "job" || kind === "booking") return "job";
  if (kind === "review") return "review";
  return "system";
}

function NotificationsScreen() {
  const { t } = useTranslation("mechanic");
  const td = useDataText();
  const { data: apiNotifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const notifications = (apiNotifications ?? []).filter(
    (notification) => notification.kind !== "payout",
  );

  return (
    <div className="space-y-5 pb-6">
      <header className="rounded-b-[2rem] bg-card px-5 pb-5 pt-8 card-elevated">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("notifications.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("notifications.subtitle")}</p>
      </header>

      <div className="space-y-3 px-5">
        {notifications.map((n: ApiNotification) => {
          const Icon = icons[toMechanicKind(n.kind)];
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => n.unread && markRead.mutate(n.id)}
              className="animate-fade-in flex w-full gap-3 rounded-3xl border border-border/70 bg-card p-4 text-left card-elevated"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[15px] font-semibold text-foreground">
                    {td(n.title)}
                  </p>
                  {n.unread ? <span className="h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{td(n.body)}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">
                  {formatDateTime(n.createdAt)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
