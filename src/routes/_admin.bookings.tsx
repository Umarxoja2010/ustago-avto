import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Eye, MoreHorizontal, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { useDataText } from "@/lib/data-i18n";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataToolbar } from "@/components/admin/DataToolbar";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TablePagination } from "@/components/admin/TablePagination";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatSom } from "@/lib/mock-data";
import { ApiError } from "@/lib/api-client";
import { useAdminBookings, useUpdateAdminBookingStatus } from "@/lib/hooks/use-admin";
import type { ApiBooking, ApiBookingStatus } from "@/lib/api-types";

export const Route = createFileRoute("/_admin/bookings")({
  head: () => ({
    meta: [
      { title: i18n.t("admin:bookings.head.title") },
      { name: "description", content: i18n.t("admin:bookings.head.description") },
      { property: "og:title", content: i18n.t("admin:bookings.head.title") },
      { property: "og:description", content: i18n.t("admin:bookings.head.ogDescription") },
    ],
  }),
  component: BookingsPage,
});

const PAGE_SIZE = 8;
const statuses: ApiBookingStatus[] = ["pending", "accepted", "completed", "rejected", "cancelled"];

function BookingsPage() {
  const { t } = useTranslation(["admin", "common"]);
  const td = useDataText();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<ApiBooking | null>(null);
  const [cancelling, setCancelling] = useState<ApiBooking | null>(null);

  const { data, isLoading } = useAdminBookings({
    status: status === "all" ? undefined : status,
    perPage: PAGE_SIZE,
    page,
  });
  const updateStatus = useUpdateAdminBookingStatus();

  const q = search.toLowerCase();
  const rows = (data?.items ?? []).filter(
    (b) =>
      String(b.id).includes(q) ||
      (b.customer?.name.toLowerCase().includes(q) ?? false) ||
      (b.master?.workshopName.toLowerCase().includes(q) ?? false),
  );
  const total = data?.meta.total ?? 0;
  const pageCount = data?.meta.lastPage ?? 1;

  const onError = (err: unknown) =>
    toast.error(err instanceof ApiError ? t(err.message, { defaultValue: err.message }) : "");

  const setStatusFor = (b: ApiBooking, next: ApiBookingStatus) => {
    updateStatus.mutate(
      { id: b.id, status: next },
      {
        onSuccess: () =>
          toast.success(
            t("admin:bookings.toasts.statusUpdated", {
              id: b.id,
              status: t(`common:status.${next}`),
            }),
          ),
        onError,
      },
    );
  };

  return (
    <>
      <PageHeader title={t("admin:bookings.title")} description={t("admin:bookings.description")} />

      <section className="card-elevated overflow-hidden rounded-2xl border border-border bg-card">
        <DataToolbar
          search={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={t("admin:bookings.searchPlaceholder")}
        >
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue placeholder={t("admin:bookings.statusPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin:bookings.allStatuses")}</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`common:status.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DataToolbar>

        {isLoading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={t("admin:bookings.emptyTitle")}
            description={t("admin:bookings.emptyDescription")}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin:bookings.table.bookingId")}</TableHead>
                  <TableHead>{t("admin:bookings.table.customer")}</TableHead>
                  <TableHead>{t("admin:bookings.table.mechanic")}</TableHead>
                  <TableHead>{t("admin:bookings.table.date")}</TableHead>
                  <TableHead>{t("admin:bookings.table.status")}</TableHead>
                  <TableHead>{t("admin:bookings.table.price")}</TableHead>
                  <TableHead className="text-right">{t("admin:bookings.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">#{b.id}</TableCell>
                    <TableCell className="text-sm">{b.customer?.name}</TableCell>
                    <TableCell className="text-sm">{b.master?.workshopName}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{b.date}</TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatSom(b.price ?? 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("admin:bookings.actionsMenu.aria")}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-xl">
                          <DropdownMenuItem onClick={() => setViewing(b)}>
                            <Eye className="mr-2 h-4 w-4" />{" "}
                            {t("admin:bookings.actionsMenu.viewBooking")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="flex items-center gap-2 text-xs">
                            <RefreshCw className="h-3 w-3" />{" "}
                            {t("admin:bookings.actionsMenu.updateStatus")}
                          </DropdownMenuLabel>
                          {statuses
                            .filter((s) => s !== b.status && s !== "cancelled")
                            .map((s) => (
                              <DropdownMenuItem key={s} onClick={() => setStatusFor(b, s)}>
                                {t("admin:bookings.actionsMenu.markAs", {
                                  status: t(`common:status.${s}`),
                                })}
                              </DropdownMenuItem>
                            ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setCancelling(b)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />{" "}
                            {t("admin:bookings.actionsMenu.cancelBooking")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!isLoading && rows.length > 0 ? (
          <TablePagination page={page} pageCount={pageCount} total={total} onPageChange={setPage} />
        ) : null}
      </section>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("admin:bookings.viewDialog.title", { id: viewing?.id })}</DialogTitle>
          </DialogHeader>
          {viewing ? (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">{t("admin:bookings.viewDialog.customer")}</dt>
                <dd>{viewing.customer?.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("admin:bookings.viewDialog.mechanic")}</dt>
                <dd>{viewing.master?.workshopName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("admin:bookings.viewDialog.service")}</dt>
                <dd>{viewing.service?.name ? td(viewing.service.name) : ""}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("admin:bookings.viewDialog.date")}</dt>
                <dd>
                  {viewing.date} · {viewing.time}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("admin:bookings.table.price")}</dt>
                <dd>{formatSom(viewing.price ?? 0)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("admin:bookings.viewDialog.status")}</dt>
                <dd>
                  <StatusBadge status={viewing.status} />
                </dd>
              </div>
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!cancelling}
        onOpenChange={(o) => !o && setCancelling(null)}
        title={t("admin:bookings.cancelDialog.title")}
        description={t("admin:bookings.cancelDialog.description", { id: cancelling?.id })}
        confirmLabel={t("admin:bookings.cancelDialog.confirmLabel")}
        onConfirm={() => {
          if (!cancelling) return;
          setStatusFor(cancelling, "cancelled");
          setCancelling(null);
        }}
      />
    </>
  );
}
