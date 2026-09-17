import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  className,
  showIcon = true,
  compact = false,
}: {
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === language);

  if (compact) {
    return (
      <Select value={language} onValueChange={(v) => setLanguage(v as LanguageCode)}>
        <SelectTrigger
          className="h-9 w-auto gap-1.5 rounded-full border-border bg-background px-3 text-sm shadow-soft [&>svg]:h-3.5 [&>svg]:w-3.5"
          aria-label={t("language.select")}
        >
          <span className="flex items-center gap-1.5">
            <span aria-hidden>{current?.flag}</span>
            <span className="hidden text-xs font-medium sm:inline">
              {current ? t(current.labelKey) : null}
            </span>
          </span>
        </SelectTrigger>
        <SelectContent align="end" className="rounded-xl">
          {SUPPORTED_LANGUAGES.map((l) => (
            <SelectItem key={l.code} value={l.code}>
              <span className="mr-1.5">{l.flag}</span>
              {t(l.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={language} onValueChange={(v) => setLanguage(v as LanguageCode)}>
      <SelectTrigger
        className={cn("h-9 w-[140px] rounded-xl text-sm", className)}
        aria-label={t("language.select")}
      >
        <span className="flex items-center gap-2 truncate">
          {showIcon ? <Globe className="h-4 w-4 shrink-0 text-muted-foreground" /> : null}
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            <span className="mr-1.5">{l.flag}</span>
            {t(l.labelKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
