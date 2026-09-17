import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Send, Trash2, Users, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { useDataText } from "@/lib/data-i18n";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/api-adapters";
import { ApiError } from "@/lib/api-client";
import { useAdminNotifications, useSendAdminBroadcast } from "@/lib/hooks/use-admin";
import type { ApiNotification } from "@/lib/api-types";

export const Route = createFileRoute("/_admin/notifications")({
  head: () => ({
    meta: [
      { title: i18n.t("admin:notifications.head.title") },
      { name: "description", content: i18n.t("admin:notifications.head.description") },
      { property: "og:title", content: i18n.t("admin:notifications.head.title") },
      { property: "og:description", content: i18n.t("admin:notifications.head.ogDescription") },
    ],
  }),
  component: NotificationsPage,
});

type Audience = "all" | "customers" | "mechanics";
type Kind = "announcement" | "alert" | "info";

const audienceIcon: Record<Audience, typeof Megaphone> = {
  all: Megaphone,
  mechanics: Wrench,
  customers: Users,
};

function NotificationsPage() {
  const { t } = useTranslation("admin");
  const td = useDataText();
  const { data, isLoading } = useAdminNotifications();
  const sendBroadcast = useSendAdminBroadcast();
  const [audience, setAudience] = useState<Audience>("all");
  const [kind, setKind] = useState<Kind>("announcement");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState<ApiNotification | null>(null);

  const items = data?.items ?? [];

  const audienceLabels: Record<Audience, string> = {
    all: t("notifications.audienceAll"),
    mechanics: t("notifications.audienceMechanics"),
    customers: t("notifications.audienceCustomers"),
  };

  const typeLabels: Record<Kind, string> = {
    announcement: t("notifications.typeAnnouncement"),
    alert: t("notifications.typeAlert"),
    info: t("notifications.typeInfo"),
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error(t("notifications.toasts.required"));
      return;
    }
    sendBroadcast.mutate(
      { title, body: message, audience, kind },
      {
        onSuccess: () => {
          setTitle("");
          setMessage("");
          toast.success(
            audience === "all"
              ? t("notifications.toasts.sentToAll")
              : t("notifications.toasts.sentToAudience", { audience: audienceLabels[audience] }),
          );
        },
        onError: (err) =>
          toast.error(err instanceof ApiError ? t(err.message, { defaultValue: err.message }) : ""),
      },
    );
  };

  return (
    <>
      <PageHeader title={t("notifications.title")} description={t("notifications.description")} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <section className="card-elevated h-fit rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">{t("notifications.newNotification")}</h2>
          <form onSubmit={send} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>{t("notifications.audience")}</Label>
              <Tabs value={audience} onValueChange={(v) => setAudience(v as Audience)}>
                <TabsList className="grid w-full grid-cols-3 rounded-xl">
                  <TabsTrigger value="all">{t("notifications.audienceAll")}</TabsTrigger>
                  <TabsTrigger value="mechanics">
                    {t("notifications.audienceMechanics")}
                  </TabsTrigger>
                  <TabsTrigger value="customers">
                    {t("notifications.audienceCustomers")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">{t("notifications.type")}</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as Kind)}>
                <SelectTrigger id="type" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">
                    {t("notifications.typeAnnouncement")}
                  </SelectItem>
                  <SelectItem value="alert">{t("notifications.typeAlert")}</SelectItem>
                  <SelectItem value="info">{t("notifications.typeInfo")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">{t("notifications.titleLabel")}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("notifications.titlePlaceholder")}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">{t("notifications.messageLabel")}</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder={t("notifications.messagePlaceholder")}
                className="rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={sendBroadcast.isPending}>
              <Send className="mr-2 h-4 w-4" /> {t("notifications.send")}
            </Button>
          </form>
        </section>

        <section className="card-elevated overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4 text-sm font-semibold">
            {t("notifications.sentHistory")}
          </div>
          {!isLoading && items.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title={t("notifications.emptyTitle")}
              description={t("notifications.emptyDescription")}
            />
          ) : (
            <ul>
              {items.map((n) => {
                const audienceKey = (n.audience ?? "all") as Audience;
                const Icon = audienceIcon[audienceKey];
                const kindKey = (
                  n.kind === "alert" || n.kind === "info" ? n.kind : "announcement"
                ) as Kind;
                return (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 border-b border-border p-4 last:border-0"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{td(n.title)}</p>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          {audienceLabels[audienceKey]} · {typeLabels[kindKey]}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{td(n.body)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(n.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive"
                      aria-label={t("notifications.deleteAria")}
                      onClick={() => setDeleting(n)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("notifications.deleteDialog.title")}
        description={t("notifications.deleteDialog.description")}
        confirmLabel={t("notifications.deleteDialog.confirmLabel")}
        onConfirm={() => {
          toast.info(t("notifications.deleteRequiresApi"));
          setDeleting(null);
        }}
      />
    </>
  );
}
