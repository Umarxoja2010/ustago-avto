import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff, MoreHorizontal, Star, Trash2 } from "lucide-react";
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
import { useAdminReviews, useToggleAdminReviewHidden } from "@/lib/hooks/use-admin";
import type { ApiReview } from "@/lib/api-types";

export const Route = createFileRoute("/_admin/reviews")({
  head: () => ({
    meta: [
      { title: i18n.t("admin:reviews.head.title") },
      { name: "description", content: i18n.t("admin:reviews.head.description") },
      { property: "og:title", content: i18n.t("admin:reviews.head.title") },
      { property: "og:description", content: i18n.t("admin:reviews.head.ogDescription") },
    ],
  }),
  component: ReviewsPage,
});

const PAGE_SIZE = 8;

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < value
              ? "h-3.5 w-3.5 fill-current text-warning"
              : "h-3.5 w-3.5 text-muted-foreground/40"
          }
        />
      ))}
    </span>
  );
}

function ReviewsPage() {
  const { t } = useTranslation(["admin", "common"]);
  const td = useDataText();
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("all");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<ApiReview | null>(null);
  const [deleting, setDeleting] = useState<ApiReview | null>(null);

  const { data, isLoading } = useAdminReviews({ perPage: PAGE_SIZE, page });
  const toggleHidden = useToggleAdminReviewHidden();

  // Search + rating filter are client-side over the current page — the
  // admin reviews endpoint only supports masterProfileId/hidden filters,
  // not free-text search or a rating filter.
  const q = search.toLowerCase();
  const rows = (data?.items ?? []).filter((r) => {
    const match =
      (r.customer?.name.toLowerCase().includes(q) ?? false) ||
      (r.master?.workshopName.toLowerCase().includes(q) ?? false) ||
      (r.comment?.toLowerCase().includes(q) ?? false);
    return match && (rating === "all" || r.rating === Number(rating));
  });
  const total = data?.meta.total ?? 0;
  const pageCount = data?.meta.lastPage ?? 1;

  const onError = (err: unknown) =>
    toast.error(err instanceof ApiError ? t(err.message, { defaultValue: err.message }) : "");

  const toggle = (r: ApiReview) => {
    toggleHidden.mutate(r.id, {
      onSuccess: () =>
        toast.success(
          r.hidden ? t("admin:reviews.toasts.unhidden") : t("admin:reviews.toasts.hidden"),
        ),
      onError,
    });
  };

  return (
    <>
      <PageHeader title={t("admin:reviews.title")} description={t("admin:reviews.description")} />

      <section className="card-elevated overflow-hidden rounded-2xl border border-border bg-card">
        <DataToolbar
          search={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={t("admin:reviews.searchPlaceholder")}
        >
          <Select
            value={rating}
            onValueChange={(v) => {
              setRating(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue placeholder={t("admin:reviews.ratingPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin:reviews.allRatings")}</SelectItem>
              {[5, 4, 3, 2, 1].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {t("admin:reviews.stars", { count: n })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DataToolbar>

        {isLoading ? (
          <TableSkeleton cols={5} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Star}
            title={t("admin:reviews.emptyTitle")}
            description={t("admin:reviews.emptyDescription")}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin:reviews.table.customer")}</TableHead>
                  <TableHead>{t("admin:reviews.table.mechanic")}</TableHead>
                  <TableHead>{t("admin:reviews.table.rating")}</TableHead>
                  <TableHead>{t("admin:reviews.table.comment")}</TableHead>
                  <TableHead>{t("admin:reviews.table.date")}</TableHead>
                  <TableHead>{t("admin:reviews.table.visibility")}</TableHead>
                  <TableHead className="text-right">{t("admin:reviews.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.customer?.name}</TableCell>
                    <TableCell className="text-sm">{r.master?.workshopName}</TableCell>
                    <TableCell>
                      <Stars value={r.rating} />
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-sm">
                      {r.comment ? td(r.comment) : ""}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDate(r.createdAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.hidden ? "hidden" : "visible"} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("admin:reviews.actionsMenu.aria")}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuItem onClick={() => setViewing(r)}>
                            <Eye className="mr-2 h-4 w-4" />{" "}
                            {t("admin:reviews.actionsMenu.viewReview")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggle(r)}>
                            <EyeOff className="mr-2 h-4 w-4" />{" "}
                            {r.hidden
                              ? t("admin:reviews.actionsMenu.unhide")
                              : t("admin:reviews.actionsMenu.hide")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleting(r)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />{" "}
                            {t("admin:reviews.actionsMenu.deleteReview")}
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
            <DialogTitle>{t("admin:reviews.viewDialog.title", { id: viewing?.id })}</DialogTitle>
          </DialogHeader>
          {viewing ? (
            <div className="space-y-3 text-sm">
              <Stars value={viewing.rating} />
              <p>{viewing.comment ? td(viewing.comment) : ""}</p>
              <p className="text-muted-foreground">
                {viewing.customer?.name} → {viewing.master?.workshopName} ·{" "}
                {formatDate(viewing.createdAt)}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("admin:reviews.deleteDialog.title")}
        description={t("admin:reviews.deleteDialog.description")}
        confirmLabel={t("admin:reviews.deleteDialog.confirmLabel")}
        onConfirm={() => {
          toast.info(t("admin:reviews.deleteRequiresApi"));
          setDeleting(null);
        }}
      />
    </>
  );
}
