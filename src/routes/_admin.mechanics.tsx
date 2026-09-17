import { createFileRoute } from "@tanstack/react-router";
import {
  Ban,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
  Wrench,
  XCircle,
} from "lucide-react";
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
import { formatDate } from "@/lib/api-adapters";
import { ApiError } from "@/lib/api-client";
import { useAdminMasters, useUpdateAdminMasterVerification } from "@/lib/hooks/use-admin";
import type { AdminMaster } from "@/lib/api-admin-types";

export const Route = createFileRoute("/_admin/mechanics")({
  head: () => ({
    meta: [
      { title: i18n.t("admin:mechanics.head.title") },
      { name: "description", content: i18n.t("admin:mechanics.head.description") },
      { property: "og:title", content: i18n.t("admin:mechanics.head.title") },
      { property: "og:description", content: i18n.t("admin:mechanics.head.ogDescription") },
    ],
  }),
  component: MechanicsPage,
});

const PAGE_SIZE = 8;

function MechanicsPage() {
  const { t } = useTranslation(["admin", "common"]);
  const td = useDataText();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<AdminMaster | null>(null);
  const [deleting, setDeleting] = useState<AdminMaster | null>(null);

  const { data, isLoading } = useAdminMasters({
    q: search || undefined,
    verificationStatus: status === "all" ? undefined : status,
    perPage: PAGE_SIZE,
    page,
  });
  const updateVerification = useUpdateAdminMasterVerification();

  const rows = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const pageCount = data?.meta.lastPage ?? 1;

  const onError = (err: unknown) =>
    toast.error(err instanceof ApiError ? t(err.message, { defaultValue: err.message }) : "");

  const setStatusFor = (
    m: AdminMaster,
    next: AdminMaster["verificationStatus"],
    toastKey: string,
  ) => {
    updateVerification.mutate(
      { id: m.id, verificationStatus: next },
      {
        onSuccess: () =>
          toast.success(t(`admin:mechanics.toasts.${toastKey}`, { workshop: m.workshopName })),
        onError,
      },
    );
  };

  return (
    <>
      <PageHeader
        title={t("admin:mechanics.title")}
        description={t("admin:mechanics.description")}
      />

      <section className="card-elevated overflow-hidden rounded-2xl border border-border bg-card">
        <DataToolbar
          search={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={t("admin:mechanics.searchPlaceholder")}
        >
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44 rounded-xl">
              <SelectValue placeholder={t("admin:mechanics.verificationPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin:mechanics.allStatuses")}</SelectItem>
              <SelectItem value="verified">{t("common:status.verified")}</SelectItem>
              <SelectItem value="pending">{t("common:status.pending")}</SelectItem>
              <SelectItem value="rejected">{t("common:status.rejected")}</SelectItem>
              <SelectItem value="suspended">{t("common:status.suspended")}</SelectItem>
            </SelectContent>
          </Select>
        </DataToolbar>

        {isLoading ? (
          <TableSkeleton cols={7} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title={t("admin:mechanics.emptyTitle")}
            description={t("admin:mechanics.emptyDescription")}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin:mechanics.table.workshop")}</TableHead>
                  <TableHead>{t("admin:mechanics.table.owner")}</TableHead>
                  <TableHead>{t("admin:mechanics.table.phone")}</TableHead>
                  <TableHead>{t("admin:mechanics.table.address")}</TableHead>
                  <TableHead>{t("admin:mechanics.table.services")}</TableHead>
                  <TableHead>{t("admin:mechanics.table.rating")}</TableHead>
                  <TableHead>{t("admin:mechanics.table.verification")}</TableHead>
                  <TableHead className="text-right">{t("admin:mechanics.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.workshopName}</TableCell>
                    <TableCell className="text-sm">{m.owner?.name}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{m.owner?.phone}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm">{m.address}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {m.services.slice(0, 2).map((s) => (
                          <span
                            key={s.id}
                            className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {td(s.name ?? "")}
                          </span>
                        ))}
                        {m.services.length > 2 ? (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                            +{m.services.length - 2}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-current text-warning" /> {m.rating}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={m.verificationStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("admin:mechanics.actionsMenu.aria")}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuItem onClick={() => setViewing(m)}>
                            <Eye className="mr-2 h-4 w-4" />{" "}
                            {t("admin:mechanics.actionsMenu.viewDetails")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toast.info(t("admin:mechanics.editRequiresApi"))}
                          >
                            <Pencil className="mr-2 h-4 w-4" />{" "}
                            {t("admin:mechanics.actionsMenu.editInformation")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setStatusFor(m, "verified", "approved")}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />{" "}
                            {t("admin:mechanics.actionsMenu.approve")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusFor(m, "rejected", "rejected")}>
                            <XCircle className="mr-2 h-4 w-4" />{" "}
                            {t("admin:mechanics.actionsMenu.reject")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setStatusFor(m, "suspended", "suspended")}
                          >
                            <Ban className="mr-2 h-4 w-4" />{" "}
                            {t("admin:mechanics.actionsMenu.suspend")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleting(m)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />{" "}
                            {t("admin:mechanics.actionsMenu.delete")}
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
            <DialogTitle>{viewing?.workshopName}</DialogTitle>
          </DialogHeader>
          {viewing ? (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">{t("admin:mechanics.viewDialog.owner")}</dt>
                <dd>{viewing.owner?.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("admin:mechanics.viewDialog.phone")}</dt>
                <dd>{viewing.owner?.phone}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">{t("admin:mechanics.viewDialog.address")}</dt>
                <dd>{viewing.address}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">
                  {t("admin:mechanics.viewDialog.services")}
                </dt>
                <dd>{viewing.services.map((s) => td(s.name ?? "")).join(", ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t("admin:mechanics.viewDialog.completedJobs")}
                </dt>
                <dd>{viewing.jobsCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("admin:mechanics.viewDialog.rating")}</dt>
                <dd>{viewing.rating}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("admin:mechanics.viewDialog.joined")}</dt>
                <dd>{formatDate(viewing.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("admin:mechanics.viewDialog.status")}</dt>
                <dd>
                  <StatusBadge status={viewing.verificationStatus} />
                </dd>
              </div>
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("admin:mechanics.deleteDialog.title")}
        description={t("admin:mechanics.deleteDialog.description", {
          workshop: deleting?.workshopName,
        })}
        confirmLabel={t("admin:mechanics.deleteDialog.confirmLabel")}
        onConfirm={() => {
          toast.info(t("admin:mechanics.deleteRequiresApi"));
          setDeleting(null);
        }}
      />
    </>
  );
}
