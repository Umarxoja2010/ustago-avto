import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarPlus,
  ChevronLeft,
  Clock,
  ExternalLink,
  Heart,
  MapPin,
  Navigation,
  Phone,
  Share2,
  Star,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RatingStars } from "@/components/customer/RatingStars";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toUiMechanic, toUiReview, toUiVehicle } from "@/lib/api-adapters";
import { api, ApiError } from "@/lib/api-client";
import { formatSom } from "@/lib/customer-data";
import { useDataText } from "@/lib/data-i18n";
import { useCreateBooking } from "@/lib/hooks/use-bookings";
import { useAddFavorite, useFavorites, useRemoveFavorite } from "@/lib/hooks/use-favorites";
import { useMaster, useMasterReviews } from "@/lib/hooks/use-masters";
import { useVehicles } from "@/lib/hooks/use-vehicles";
import i18n from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ApiMasterProfile } from "@/lib/api-types";

export const Route = createFileRoute("/app/mechanic/$id")({
  // Prefetches into the same React Query cache key useMaster() reads below,
  // so head() gets real data to build tags from and the component's own
  // useMaster(id) call finds it already cached — no double-fetch. Falls
  // back to generic tags on any failure (not found, unverified, network)
  // rather than crashing the route; the component already renders its own
  // "workshop unavailable" screen for exactly that case.
  loader: async ({ params, context }) => {
    try {
      return await context.queryClient.ensureQueryData({
        queryKey: ["masters", params.id],
        queryFn: () => api.get<ApiMasterProfile>(`/masters/${params.id}`, undefined, true),
      });
    } catch {
      return null;
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: i18n.t("customer:head.mechanic.title", { defaultValue: "Workshop" }) },
          { name: "robots", content: "noindex" },
        ],
      };
    }

    const district = loaderData.district ?? loaderData.city;
    const title = i18n.t("customer:head.mechanic.titleWithName", { name: loaderData.workshopName });

    return {
      meta: [
        { title },
        {
          name: "description",
          content: i18n.t("customer:head.mechanic.description", {
            name: loaderData.workshopName,
            district,
            rating: loaderData.rating,
            reviewCount: loaderData.reviewCount,
          }),
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: i18n.t("customer:head.mechanic.ogDescription", { district }),
        },
        ...(loaderData.cover ? [{ property: "og:image", content: loaderData.cover }] : []),
      ],
    };
  },
  component: MechanicScreen,
});

const slots = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function MechanicScreen() {
  const { t } = useTranslation("customer");
  const td = useDataText();
  const { id } = Route.useParams();
  const { data: apiMaster, isLoading } = useMaster(id);
  const { data: apiReviews } = useMasterReviews(id);
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const { data: apiVehicles } = useVehicles();
  const createBooking = useCreateBooking();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(false);
  const [slot, setSlot] = useState(slots[1]);
  const [pickedServiceId, setPickedServiceId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">
        {t("mechanic.notSpecified")}
      </div>
    );
  }

  if (!apiMaster) {
    return (
      <div className="grid min-h-[50vh] place-items-center gap-3 px-6 text-center">
        <p className="text-lg font-semibold text-foreground">{t("mechanic.unavailableTitle")}</p>
        <Link
          to="/app/search"
          search={{ service: undefined }}
          className="text-sm font-medium text-primary"
        >
          {t("mechanic.goBack")}
        </Link>
      </div>
    );
  }

  const mechanic = toUiMechanic(apiMaster);
  const reviews = (apiReviews?.items ?? []).map(toUiReview);
  const vehicles = (apiVehicles ?? []).map(toUiVehicle);
  const activeServices = apiMaster.services.filter((s) => s.active);
  const picked = activeServices.find((s) => s.id === pickedServiceId) ?? activeServices[0];

  const fav = favorites?.some((m) => String(m.id) === id) ?? false;
  const favPending = addFavorite.isPending || removeFavorite.isPending;

  const targetLat = apiMaster.lat ?? (mechanic.lat || 41.311081);
  const targetLng = apiMaster.lng ?? (mechanic.lng || 69.240562);
  const hasCoords =
    Boolean(apiMaster.lat && apiMaster.lng) || Boolean(mechanic.lat && mechanic.lng);

  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${mechanic.address}, ${mechanic.district || ""}`)}`;

  const confirm = () => {
    if (!picked) return;
    createBooking.mutate(
      {
        masterServiceId: picked.id,
        vehicleId: vehicles[0] ? Number(vehicles[0].id) : undefined,
        date: tomorrowIso(),
        time: slot,
      },
      {
        onSuccess: () => {
          setBooking(false);
          toast.success(t("mechanic.bookingRequested"), {
            description: t("mechanic.bookingRequestedDescription", {
              name: mechanic.name,
              time: slot,
            }),
          });
          navigate({ to: "/app/bookings" });
        },
        onError: (err) => {
          toast.error(
            err instanceof ApiError
              ? t(err.message, { defaultValue: err.message })
              : t("mechanic.bookAppointment"),
          );
        },
      },
    );
  };

  return (
    <div className="pb-6">
      <div className="relative h-56">
        <img
          src={mechanic.cover}
          alt={t("mechanic.coverAlt", { name: mechanic.name })}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Link
            to="/app/search"
            search={{ service: undefined }}
            aria-label={t("mechanic.goBack")}
            className="grid h-10 w-10 place-items-center rounded-full bg-background/80 backdrop-blur-md transition-transform active:scale-90"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={t("mechanic.share")}
              onClick={() => toast(t("mechanic.shareToast"))}
              className="grid h-10 w-10 place-items-center rounded-full bg-background/80 backdrop-blur-md transition-transform active:scale-90"
            >
              <Share2 className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              aria-label={fav ? t("mechanic.removeFromFavorites") : t("mechanic.saveWorkshop")}
              disabled={favPending}
              onClick={() => {
                const masterId = Number(id);
                if (fav) removeFavorite.mutate(masterId);
                else addFavorite.mutate(masterId);
              }}
              className="grid h-10 w-10 place-items-center rounded-full bg-background/80 backdrop-blur-md transition-transform active:scale-90"
            >
              <Heart
                className={cn("h-[18px] w-[18px]", fav && "fill-destructive text-destructive")}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="-mt-8 space-y-5 rounded-t-[2rem] bg-app-canvas px-5 pt-5">
        <section className="space-y-3 rounded-3xl border border-border/70 bg-card p-4 card-elevated">
          <div className="flex gap-3">
            <img src={mechanic.logo} alt="" className="h-14 w-14 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <h1 className="flex items-center gap-1.5 text-lg font-semibold leading-tight text-foreground">
                <span className="truncate">{mechanic.name}</span>
                {mechanic.verified ? (
                  <BadgeCheck className="h-5 w-5 shrink-0 text-primary" />
                ) : null}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("mechanic.yearsExperience", {
                  owner: mechanic.owner,
                  years: mechanic.experienceYears,
                })}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-muted/60 p-3 text-center">
            <div>
              <p className="flex items-center justify-center gap-1 text-sm font-semibold text-foreground">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {mechanic.rating}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t("mechanic.reviewsCount", { count: mechanic.reviewCount })}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{mechanic.district || "—"}</p>
              <p className="text-[11px] text-muted-foreground">{mechanic.district}</p>
            </div>
            <div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  mechanic.open ? "text-success" : "text-muted-foreground",
                )}
              >
                {mechanic.open ? t("mechanic.openNow") : t("mechanic.closed")}
              </p>
              <p className="text-[11px] text-muted-foreground">{t("mechanic.untilTime")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-11 w-full rounded-2xl gap-2 font-medium border-primary/40 text-primary hover:bg-primary/5"
              onClick={() => {
                window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
              }}
            >
              <Navigation className="h-4 w-4 text-primary" />
              <span>{t("mechanic.navigate")} (Google Maps)</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </Button>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-border/70 bg-card card-elevated">
          <div className="flex items-center justify-between p-4 pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                {t("mechanic.workshopLocation")}
              </h2>
            </div>
            {hasCoords && (
              <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-lg">
                {targetLat.toFixed(4)}, {targetLng.toFixed(4)}
              </span>
            )}
          </div>

          <div className="relative h-52 w-full overflow-hidden bg-muted/30">
            <iframe
              title={`Ustaxona joylashuvi: ${mechanic.name}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={
                hasCoords
                  ? `https://maps.google.com/maps?q=${targetLat},${targetLng}&z=15&output=embed`
                  : `https://maps.google.com/maps?q=${encodeURIComponent(`${mechanic.address || mechanic.name}`)}&z=15&output=embed`
              }
            />
          </div>

          <div className="p-4 space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{mechanic.address || "—"}</p>
              {mechanic.district && (
                <p className="text-xs text-muted-foreground">{mechanic.district}</p>
              )}
            </div>

            {/* Direct Google Maps Action Button */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl bg-primary text-primary-foreground font-medium text-sm shadow hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <Navigation className="h-4 w-4" />
              <span>{t("mechanic.openInGoogleMaps")}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </a>
          </div>
        </section>

        <section className="space-y-2.5 rounded-3xl border border-border/70 bg-card p-4 card-elevated">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
            <Clock className="h-4 w-4 text-primary" /> {t("mechanic.workingHours")}
          </h2>
          {mechanic.hours.map((h) => (
            <div key={h.day} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{td(h.day)}</span>
              <span className="font-medium text-foreground">{td(h.time)}</span>
            </div>
          ))}
        </section>

        <Tabs defaultValue="services">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl">
            <TabsTrigger value="services" className="rounded-xl text-xs">
              {t("mechanic.tabs.services")}
            </TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-xl text-xs">
              {t("mechanic.tabs.gallery")}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-xl text-xs">
              {t("mechanic.tabs.reviews")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-4">
            <div className="space-y-2">
              {activeServices.length > 0 ? (
                activeServices.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-2xl border border-border/70 bg-card p-3.5 card-elevated"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-sm font-semibold text-foreground">{td(s.name ?? "")}</p>
                      {s.duration && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 text-primary" /> {td(s.duration)}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-sm font-semibold text-primary">
                        {s.price != null ? formatSom(s.price) : "Kelishilgan"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-wrap gap-2">
                  {mechanic.services.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-primary/10 px-3.5 py-2 text-sm font-medium text-primary"
                    >
                      {td(s)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="mt-4">
            <div className="grid grid-cols-2 gap-2.5">
              {mechanic.gallery.map((g, i) => (
                <img
                  key={i}
                  src={g}
                  alt={t("mechanic.galleryAlt", { name: mechanic.name, index: i + 1 })}
                  loading="lazy"
                  className="h-28 w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4 space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex items-center gap-3">
                  <img src={r.avatar} alt="" className="h-9 w-9 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{r.author}</p>
                    <p className="text-[11px] text-muted-foreground">{td(r.date)}</p>
                  </div>
                  <RatingStars value={r.rating} />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{td(r.text)}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <Button
          className="h-13 w-full rounded-2xl text-base"
          onClick={() => setBooking(true)}
          disabled={activeServices.length === 0}
        >
          <CalendarPlus className="mr-1.5 h-5 w-5" /> {t("mechanic.bookAppointment")}
        </Button>
      </div>

      <Drawer open={booking} onOpenChange={setBooking}>
        <DrawerContent className="mx-auto max-w-[430px] rounded-t-3xl">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-xl">
              {t("mechanic.bookAt", { name: mechanic.name })}
            </DrawerTitle>
          </DrawerHeader>
          <div className="space-y-5 p-4 pb-8">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t("mechanic.service")}</p>
              <div className="space-y-2">
                {activeServices.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPickedServiceId(s.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition-colors",
                      picked?.id === s.id
                        ? "border-primary bg-primary/5"
                        : "border-border/70 bg-card",
                    )}
                  >
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {td(s.name ?? "")}
                      </span>
                      {s.duration && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{td(s.duration)}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {s.price != null ? formatSom(s.price) : "Kelishilgan"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t("mechanic.tomorrow")}</p>
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlot(s)}
                    className={cn(
                      "rounded-2xl border py-2.5 text-sm font-medium transition-colors",
                      slot === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/70 bg-card text-foreground",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <Button
              className="h-12 w-full rounded-2xl text-base"
              onClick={confirm}
              disabled={createBooking.isPending || !picked}
            >
              {t("mechanic.confirmBooking")}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
