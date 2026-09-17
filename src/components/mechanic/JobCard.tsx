import { CalendarDays, Car, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { formatSom, type MechanicJob } from "@/lib/mechanic-data";
import { useDataText } from "@/lib/data-i18n";
import { cn } from "@/lib/utils";

const stateStyles: Record<MechanicJob["state"], string> = {
  request: "bg-warning/15 text-warning",
  active: "bg-primary-soft text-primary",
  completed: "bg-success/12 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

export function JobCard({
  job,
  onAccept,
  onReject,
  onComplete,
  onOpen,
}: {
  job: MechanicJob;
  onAccept?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
  onOpen?: () => void;
}) {
  const { t } = useTranslation("mechanic");
  const td = useDataText();
  const stateLabels: Record<MechanicJob["state"], string> = {
    request: t("jobCard.state.request"),
    active: t("jobCard.state.active"),
    completed: t("jobCard.state.completed"),
    rejected: t("jobCard.state.rejected"),
  };

  return (
    <article className="animate-fade-in rounded-3xl border border-border/70 bg-card p-4 card-elevated">
      <button type="button" onClick={onOpen} className="w-full text-left">
        <div className="flex items-start gap-3">
          <img src={job.avatar} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-foreground">{job.customer}</p>
            <p className="truncate text-sm text-muted-foreground">{td(job.service)}</p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
              stateStyles[job.state],
            )}
          >
            {stateLabels[job.state]}
          </span>
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <Car className="h-3.5 w-3.5 text-primary" /> {job.vehicle}
          </p>
          <p className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-primary" /> {job.date} · {job.time}
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" /> {job.address}
          </p>
        </div>

        <p className="mt-3 text-base font-semibold text-foreground">{formatSom(job.price)}</p>
      </button>

      {onAccept || onReject || onComplete ? (
        <div className="mt-4 flex gap-2">
          {onReject ? (
            <Button variant="outline" className="h-11 flex-1 rounded-2xl" onClick={onReject}>
              {t("jobCard.reject")}
            </Button>
          ) : null}
          {onAccept ? (
            <Button className="h-11 flex-1 rounded-2xl" onClick={onAccept}>
              {t("jobCard.accept")}
            </Button>
          ) : null}
          {onComplete ? (
            <Button className="h-11 flex-1 rounded-2xl" onClick={onComplete}>
              {t("jobCard.markCompleted")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
