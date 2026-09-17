import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDataText } from "@/lib/data-i18n";
import { toast } from "sonner";
import { BrandLogo } from "@/components/BrandLogo";
import { MechanicCard } from "@/components/customer/MechanicCard";
import { OfferCarousel } from "@/components/customer/OfferCarousel";
import { PullToRefresh } from "@/components/customer/PullToRefresh";
import { SectionHeader } from "@/components/customer/SectionHeader";
import { ServiceIcon } from "@/components/customer/ServiceIcon";
import { MechanicCardSkeleton } from "@/components/customer/Skeletons";
import { toUiMechanic } from "@/lib/api-adapters";
import { useAuth } from "@/lib/auth";
import { formatSom, popularServices, quickServices } from "@/lib/customer-data";
import { calculateServiceAveragePrice } from "@/lib/service-pricing";
import { useMasters } from "@/lib/hooks/use-masters";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { useUserLocation } from "@/lib/hooks/use-user-location";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/app/")({
  component: HomeScreen,
});

function HomeScreen() {
  const { t } = useTranslation(["customer", "common"]);
  const td = useDataText();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const {
    coords: userCoords,
    isRealGps,
    status: locationStatus,
    requestLocation,
  } = useUserLocation();

  const { data: mastersPage, isLoading } = useMasters({
    sort: "nearest",
    lat: userCoords.lat,
    lng: userCoords.lng,
    perPage: 50,
  });
  const { data: apiNotifications } = useNotifications();
  const unread = (apiNotifications ?? []).filter((n) => n.unread).length;

  const allUiMasters = useMemo(
    () => (mastersPage?.items ?? []).map((m) => toUiMechanic(m, userCoords)),
    [mastersPage?.items, userCoords],
  );

  const nearby = useMemo(() => {
    return allUiMasters
      .slice()
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 6);
  }, [allUiMasters]);

  const serviceAverages = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of popularServices) {
      map[s.id] = calculateServiceAveragePrice(s, allUiMasters);
    }
    return map;
  }, [allUiMasters]);

  const firstName = user?.name?.split(" ")[0] ?? "";
  const avatarUrl =
    user?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name ?? "")}&backgroundColor=2563EB&textColor=ffffff`;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t("customer:home.greeting.morning");
    if (h < 18) return t("customer:home.greeting.afternoon");
    return t("customer:home.greeting.evening");
  };

  return (
    <PullToRefresh
      onRefresh={async () => {
        requestLocation();
        await queryClient.invalidateQueries({ queryKey: ["masters"] });
        await queryClient.invalidateQueries({ queryKey: ["notifications"] });
        toast.success(t("customer:home.refreshSuccess"));
      }}
    >
      <div className="space-y-7 pb-6">
        <header className="space-y-4 rounded-b-[2rem] bg-card px-5 pb-6 pt-5 card-elevated border-b border-border/40">
          <div className="flex items-center justify-between">
            <BrandLogo size="sm" theme="auto" />
            <Link
              to="/app/notifications"
              aria-label={t("customer:home.notificationsLabel")}
              className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted transition-transform active:scale-90"
            >
              <Bell className="h-4.5 w-4.5 text-foreground" />
              {unread > 0 ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
              ) : null}
            </Link>
          </div>

          <div className="flex items-center gap-3 pt-0.5">
            <img
              src={avatarUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-primary/25"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-foreground">
                {greeting()}, {firstName} 👋
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{user?.workshop?.city ?? "Tashkent"}</span>
                <span>•</span>
                {isRealGps ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t("customer:home.gpsActive", { defaultValue: "GPS aniqlandi" })}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={requestLocation}
                    className="text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    {locationStatus === "requesting"
                      ? t("customer:home.gpsRequesting", { defaultValue: "Aniqlanmoqda..." })
                      : t("customer:home.enableGps", { defaultValue: "Joylashuvni yoqish" })}
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate({ to: "/app/search", search: { service: undefined } })}
            className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-muted/60 px-4 py-3 text-left transition-colors active:bg-muted"
          >
            <Search className="h-4.5 w-4.5 text-muted-foreground" />
            <span className="flex-1 text-sm text-muted-foreground">
              {t("customer:home.searchPlaceholder")}
            </span>
            <SlidersHorizontal className="h-4 w-4 text-primary" />
          </button>
        </header>

        <section className="space-y-3">
          <SectionHeader
            title={t("customer:home.sections.quickServices")}
            action={t("customer:home.seeAll")}
            to="/app/search"
          />
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
            {quickServices.map((s) => {
              const avgPrice = serviceAverages[s.id] ?? s.from;
              return (
                <Link
                  key={s.id}
                  to="/app/search"
                  search={{ service: s.name }}
                  className="flex w-[114px] shrink-0 flex-col items-center gap-2 rounded-3xl border border-border/70 bg-card px-2.5 py-3.5 text-center card-elevated transition-transform duration-200 active:scale-95"
                >
                  <ServiceIcon icon={s.icon} color={s.color} />
                  <span className="text-[12px] font-medium leading-tight text-foreground">
                    {td(s.name)}
                  </span>
                  <span className="text-[11px] leading-tight text-muted-foreground">
                    {t("customer:home.from", { price: formatSom(avgPrice) })}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader
            title={t("customer:home.sections.nearbyMechanics")}
            action={t("customer:home.seeAll")}
            to="/app/search"
          />
          <div className="no-scrollbar flex gap-4 overflow-x-auto px-5 pb-2">
            {isLoading
              ? Array.from({ length: 3 }, (_, i) => <MechanicCardSkeleton key={i} />)
              : nearby.map((m) => <MechanicCard key={m.id} mechanic={m} />)}
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader title={t("customer:home.sections.specialOffers")} />
          <OfferCarousel />
        </section>

        <section className="space-y-3">
          <SectionHeader
            title={t("customer:home.sections.popularServices")}
            action={t("customer:home.browse")}
            to="/app/search"
          />
          <div className="grid grid-cols-2 gap-3 px-5">
            {popularServices.map((s) => {
              const avgPrice = serviceAverages[s.id] ?? s.from;
              return (
                <Link
                  key={s.id}
                  to="/app/search"
                  search={{ service: s.name }}
                  className="flex items-center gap-3 rounded-3xl border border-border/70 bg-card p-3.5 card-elevated transition-transform duration-200 active:scale-[0.97]"
                >
                  <ServiceIcon icon={s.icon} color={s.color} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-foreground">
                      {td(s.name)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("customer:home.avg", { price: formatSom(avgPrice) })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </PullToRefresh>
  );
}
