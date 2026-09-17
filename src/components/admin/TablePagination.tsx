import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function TablePagination({
  page,
  pageCount,
  total,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useTranslation("admin");
  return (
    <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {t("pagination.summary", { total, page, pageCount: Math.max(pageCount, 1) })}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" /> {t("pagination.prev")}
        </Button>
        {Array.from({ length: Math.max(pageCount, 1) }).map((_, i) => (
          <Button
            key={i}
            size="sm"
            variant={page === i + 1 ? "default" : "ghost"}
            className="h-8 w-8 rounded-lg p-0"
            onClick={() => onPageChange(i + 1)}
          >
            {i + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          {t("pagination.next")} <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
