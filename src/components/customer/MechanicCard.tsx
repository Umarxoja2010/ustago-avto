import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { formatSom, type MechanicProfile } from "@/lib/customer-data";
import { useDataText } from "@/lib/data-i18n";
import { useAddFavorite, useFavorites, useRemoveFavorite } from "@/lib/hooks/use-favorites";
import { cn } from "@/lib/utils";

function OpenBadge({ open }: { open: boolean }) {
  const { t } = useTranslation("customer");
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md",
        open ? "bg-success/90 text-success-foreground" : "bg-foreground/70 text-background",
      )}
    >
      {open ? t("components.openNow") : t("components.closed")}
    </span>
  );
}

function FavButton({ id, floating = false }: { id: string; floating?: boolean }) {
  const { t } = useTranslation("customer");
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const active = favorites?.some((m) => String(m.id) === id) ?? false;
  const pending = addFavorite.isPending || removeFavorite.isPending;
  return (
    <button
      type="button"
      aria-label={active ? t("components.removeFromFavorites") : t("components.addToFavorites")}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const masterId = Number(id);
        if (active) removeFavorite.mutate(masterId);
        else addFavorite.mutate(masterId);
      }}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full transition-transform duration-200 active:scale-90",
        floating ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-muted",
        pending && "opacity-60",
      )}
    >
      <Heart
        className={cn(
          "h-[18px] w-[18px] transition-colors",
          active ? "fill-destructive text-destructive" : "text-muted-foreground",
        )}
      />
    </button>
  );
}

export function MechanicCard({ mechanic }: { mechanic: MechanicProfile }) {
  const { t } = useTranslation("customer");
  return (
    <article className="w-[268px] shrink-0 overflow-hidden rounded-3xl border border-border/70 bg-card card-elevated">
      <div className="relative h-32">
        <img
          src={mechanic.cover}
          alt={`${mechanic.name} workshop`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute left-3 top-3">
          <OpenBadge open={mechanic.open} />
        </div>
        <div className="absolute right-3 top-3">
          <FavButton id={mechanic.id} floating />
        </div>
      </div>
      <div className="space-y-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-[15px] font-semibold text-foreground">{mechanic.name}</h3>
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-foreground">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            {mechanic.rating}
          </span>
        </div>
        <p className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {mechanic.distanceKm > 0 ? `${mechanic.distanceKm} km` : "< 1 km"}
          </span>
          <span>{t("mechanic.reviewsCount", { count: mechanic.reviewCount })}</span>
        </p>
        <div className="flex items-center justify-between border-t border-border/50 pt-2">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
              {t("components.fromPrice", { defaultValue: "dan" })}
            </span>
            <span className="text-xs font-bold text-primary">
              {formatSom(mechanic.startingPrice)}
            </span>
          </div>
          <Button
            asChild
            size="sm"
            className="rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            <Link to="/app/mechanic/$id" params={{ id: mechanic.id }}>
              BRON QILISH
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function MechanicListCard({ mechanic }: { mechanic: MechanicProfile }) {
  const { t } = useTranslation("customer");
  const td = useDataText();
  return (
    <Link
      to="/app/mechanic/$id"
      params={{ id: mechanic.id }}
      className="flex gap-3 rounded-3xl border border-border/70 bg-card p-3 card-elevated transition-transform duration-200 active:scale-[0.985]"
    >
      <img
        src={mechanic.cover}
        alt={`${mechanic.name} workshop`}
        loading="lazy"
        className="h-24 w-24 shrink-0 rounded-2xl object-cover"
      />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-[15px] font-semibold text-foreground">{mechanic.name}</h3>
          <FavButton id={mechanic.id} />
        </div>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            {mechanic.rating}
            <span className="font-normal text-muted-foreground">({mechanic.reviewCount})</span>
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {mechanic.distanceKm > 0 ? `${mechanic.distanceKm} km` : "< 1 km"}
          </span>
          <OpenBadge open={mechanic.open} />
        </p>
        <div className="flex items-center justify-between pt-0.5">
          <p className="truncate text-xs text-muted-foreground">
            {mechanic.services.slice(0, 2).map(td).join(" · ")}
          </p>
          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
            dan {formatSom(mechanic.startingPrice)}
          </span>
        </div>
      </div>
    </Link>
  );
}
