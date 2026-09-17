import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, ChevronLeft, Megaphone, MessageSquare, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/api-adapters";
import { useDataText } from "@/lib/data-i18n";
import { useMarkNotificationRead, useNotifications } from "@/lib/hooks/use-notifications";
import i18n from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ApiNotification } from "@/lib/api-types";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title: i18n.t("customer:head.notifications.title") },
      {
        name: "description",
        content: i18n.t("customer:head.notifications.description"),
      },
      { property: "og:title", content: i18n.t("customer:head.notifications.title") },
      { property: "og:description", content: i18n.t("customer:head.notifications.ogDescription") },
    ],
  }),
  component: NotificationsScreen,
});

type UiKind = "booking" | "message" | "promo" | "announcement";

const meta = {
  booking: { icon: BellRing, tone: "bg-primary/10 text-primary" },
  message: { icon: MessageSquare, tone: "bg-info/10 text-info" },
  promo: { icon: Tag, tone: "bg-success/10 text-success" },
  announcement: { icon: Megaphone, tone: "bg-warning/15 text-warning" },
} as const;

// Backend `kind` is a free-form string (booking-flow events use "booking",
// admin broadcasts default to "announcement") — anything else we haven't
// seen yet still needs an icon, so it falls back to the announcement style.
function toUiKind(kind: string): UiKind {
  return kind === "booking" || kind === "message" || kind === "promo" || kind === "announcement"
    ? kind
    : "announcement";
}

function Row({ n, onRead }: { n: ApiNotification; onRead: () => void }) {
  const td = useDataText();
  const { icon: Icon, tone } = meta[toUiKind(n.kind)];
  return (
    <button
      type="button"
      onClick={onRead}
      className={cn(
        "flex w-full gap-3 rounded-3xl border border-border/70 p-4 text-left card-elevated transition-colors",
        n.unread ? "bg-card" : "bg-card/60",
      )}
    >
      <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", tone)}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-sm font-semibold text-foreground">{td(n.title)}</h2>
          {n.unread ? <span className="h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{td(n.body)}</p>
        <p className="mt-1.5 text-[11px] text-muted-foreground">{formatDateTime(n.createdAt)}</p>
      </div>
    </button>
  );
}

function NotificationsScreen() {
  const { t } = useTranslation("customer");
  const { data: apiNotifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const notifications = apiNotifications ?? [];

  const groups = {
    all: notifications,
    booking: notifications.filter((n) => toUiKind(n.kind) === "booking"),
    message: notifications.filter((n) => toUiKind(n.kind) === "message"),
    promo: notifications.filter(
      (n) => toUiKind(n.kind) === "promo" || toUiKind(n.kind) === "announcement",
    ),
  };

  return (
    <div className="space-y-5 pb-6">
      <header className="flex items-center gap-3 rounded-b-[2rem] bg-card px-5 pb-5 pt-8 card-elevated">
        <Link
          to="/app"
          aria-label={t("notifications.backAria")}
          className="grid h-10 w-10 place-items-center rounded-full bg-muted transition-transform active:scale-90"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("notifications.title")}
        </h1>
      </header>

      <Tabs defaultValue="all" className="px-5">
        <TabsList className="grid w-full grid-cols-4 rounded-2xl">
          <TabsTrigger value="all" className="rounded-xl text-xs">
            {t("notifications.tabs.all")}
          </TabsTrigger>
          <TabsTrigger value="booking" className="rounded-xl text-xs">
            {t("notifications.tabs.bookings")}
          </TabsTrigger>
          <TabsTrigger value="message" className="rounded-xl text-xs">
            {t("notifications.tabs.messages")}
          </TabsTrigger>
          <TabsTrigger value="promo" className="rounded-xl text-xs">
            {t("notifications.tabs.news")}
          </TabsTrigger>
        </TabsList>
        {(Object.keys(groups) as (keyof typeof groups)[]).map((k) => (
          <TabsContent key={k} value={k} className="mt-4 space-y-3">
            {groups[k].map((n) => (
              <Row key={n.id} n={n} onRead={() => n.unread && markRead.mutate(n.id)} />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
