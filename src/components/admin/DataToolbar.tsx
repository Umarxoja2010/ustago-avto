import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";

export function DataToolbar({
  search,
  onSearch,
  placeholder,
  children,
}: {
  search: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
}) {
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder ?? t("actions.searchPlaceholder")}
          className="rounded-xl pl-9"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
