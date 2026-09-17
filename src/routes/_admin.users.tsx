import { createFileRoute } from "@tanstack/react-router";
import {
  Ban,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataToolbar } from "@/components/admin/DataToolbar";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TablePagination } from "@/components/admin/TablePagination";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useAdminUsers, useUpdateAdminUserStatus } from "@/lib/hooks/use-admin";
import type { AdminUser } from "@/lib/api-admin-types";

export const Route = createFileRoute("/_admin/users")({
  head: () => ({
    meta: [
      { title: i18n.t("admin:users.head.title") },
      { name: "description", content: i18n.t("admin:users.head.description") },
      { property: "og:title", content: i18n.t("admin:users.head.title") },
      { property: "og:description", content: i18n.t("admin:users.head.ogDescription") },
    ],
  }),
  component: UsersPage,
});

const PAGE_SIZE = 8;

function UsersPage() {
  const { t } = useTranslation("admin");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  const { data, isLoading } = useAdminUsers({
    q: search || undefined,
    status: status === "all" ? undefined : status,
    perPage: PAGE_SIZE,
    page,
  });
  const updateStatus = useUpdateAdminUserStatus();

  const rows = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const pageCount = data?.meta.lastPage ?? 1;

  const onError = (err: unknown) =>
    toast.error(err instanceof ApiError ? t(err.message, { defaultValue: err.message }) : "");

  const setStatusFor = (user: AdminUser, next: "active" | "suspended") => {
    updateStatus.mutate(
      { id: user.id, status: next },
      {
        onSuccess: () =>
          toast.success(t("users.toasts.statusChanged", { name: user.name, status: next })),
        onError,
      },
    );
  };

  return (
    <>
      <PageHeader
        title={t("users.title")}
        description={t("users.description", { count: total })}
        actions={
          <Button className="rounded-xl" onClick={() => toast.info(t("users.inviteRequiresApi"))}>
            <UserPlus className="mr-2 h-4 w-4" /> {t("users.inviteUser")}
          </Button>
        }
      />

      <section className="card-elevated overflow-hidden rounded-2xl border border-border bg-card">
        <DataToolbar
          search={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={t("users.searchPlaceholder")}
        >
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue placeholder={t("users.statusPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("users.allStatuses")}</SelectItem>
              <SelectItem value="active">{t("common:status.active")}</SelectItem>
              <SelectItem value="pending">{t("common:status.pending")}</SelectItem>
              <SelectItem value="suspended">{t("common:status.suspended")}</SelectItem>
            </SelectContent>
          </Select>
        </DataToolbar>

        {isLoading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title={t("users.emptyTitle")}
            description={t("users.emptyDescription")}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("users.table.user")}</TableHead>
                  <TableHead>{t("users.table.phone")}</TableHead>
                  <TableHead>{t("users.table.email")}</TableHead>
                  <TableHead>{t("users.table.registered")}</TableHead>
                  <TableHead>{t("users.table.status")}</TableHead>
                  <TableHead className="text-right">{t("users.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-primary-soft text-xs text-primary">
                            {u.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{u.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{u.city}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{u.phone}</TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={u.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("users.actionsMenu.aria")}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuItem onClick={() => setViewing(u)}>
                            <Eye className="mr-2 h-4 w-4" /> {t("users.actionsMenu.viewProfile")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info(t("users.editRequiresApi"))}>
                            <Pencil className="mr-2 h-4 w-4" /> {t("users.actionsMenu.editUser")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {u.role !== "admin" ? (
                            u.status === "active" ? (
                              <DropdownMenuItem onClick={() => setStatusFor(u, "suspended")}>
                                <Ban className="mr-2 h-4 w-4" />{" "}
                                {t("users.actionsMenu.suspendAccount")}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => setStatusFor(u, "active")}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />{" "}
                                {t("users.actionsMenu.activateAccount")}
                              </DropdownMenuItem>
                            )
                          ) : null}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleting(u)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />{" "}
                            {t("users.actionsMenu.deleteAccount")}
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
            <DialogTitle>{t("users.viewDialog.title")}</DialogTitle>
          </DialogHeader>
          {viewing ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary-soft text-primary">
                    {viewing.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{viewing.name}</p>
                  <p className="text-muted-foreground">#{viewing.id}</p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-muted-foreground">{t("users.viewDialog.phone")}</dt>
                  <dd>{viewing.phone}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("users.viewDialog.email")}</dt>
                  <dd className="break-all">{viewing.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("users.viewDialog.city")}</dt>
                  <dd>{viewing.city ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("users.viewDialog.registered")}</dt>
                  <dd>{formatDate(viewing.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("users.viewDialog.status")}</dt>
                  <dd>
                    <StatusBadge status={viewing.status} />
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("users.deleteDialog.title")}
        description={t("users.deleteDialog.description", { name: deleting?.name })}
        confirmLabel={t("users.deleteDialog.confirmLabel")}
        onConfirm={() => {
          toast.info(t("users.deleteRequiresApi"));
          setDeleting(null);
        }}
      />
    </>
  );
}
