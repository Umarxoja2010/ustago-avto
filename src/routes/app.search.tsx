import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpDown, SearchX, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/customer/EmptyState";
import { MechanicListCard } from "@/components/customer/MechanicCard";
import { ListCardSkeleton } from "@/components/customer/Skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toUiMechanic } from "@/lib/api-adapters";
import i18n from "@/lib/i18n";
import { formatSom, quickServices } from "@/lib/customer-data";
import { useDataText } from "@/lib/data-i18n";
import { useMasters, type MasterSearchFilters } from "@/lib/hooks/use-masters";
import { useUserLocation } from "@/lib/hooks/use-user-location";

export const Route = createFileRoute("/app/search")({
  validateSearch: (s: Record<string, unknown>) => ({
    service: typeof s.service === "string" ? s.service : undefined,
  }),
  head: () => ({
    meta: [
      { title: i18n.t("customer:head.search.title") },
      {
        name: "description",
        content: i18n.t("customer:head.search.description"),
      },
      { property: "og:title", content: i18n.t("customer:head.search.title") },
      { property: "og:description", content: i18n.t("customer:head.search.ogDescription") },
    ],
  }),
  component: SearchScreen,
});

const REGIONS = [
  "All regions",
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand viloyati",
  "Farg'ona viloyati",
  "Andijon viloyati",
  "Namangan viloyati",
  "Buxoro viloyati",
  "Sirdaryo viloyati",
  "Jizzax viloyati",
  "Qashqadaryo viloyati",
  "Surxondaryo viloyati",
  "Navoiy viloyati",
  "Xorazm viloyati",
  "Qoraqalpog'iston Respublikasi",
] as const;

const vehicleTypeKeys = [
  "any",
  "passengerCars",
  "trucks",
  "foreignCars",
  "cobalt",
  "gentra",
  "nexia",
  "spark",
  "matiz",
  "damas",
  "tracker",
  "malibu",
  "onix",
  "suv",
  "sedan",
  "hatchback",
  "minivan",
] as const;

const vehicleTypes = [
  "Any",
  "Yengil mashinalar",
  "Yuk mashinalari",
  "Chet el mashinalari",
  "Cobalt",
  "Gentra",
  "Nexia",
  "Spark",
  "Matiz",
  "Damas",
  "Tracker",
  "Malibu",
  "Onix",
  "SUV",
  "Sedan",
  "Hatchback",
  "Minivan",
];

const sortKeys = ["recommended", "nearest", "topRated", "lowestPrice"] as const;
const sorts = ["Recommended", "Nearest", "Top rated", "Lowest price"];

function toApiSort(sort: string): MasterSearchFilters["sort"] {
  if (sort === "Lowest price") return "price";
  if (sort === "Nearest") return "nearest";
  return "rating";
}

function useDebounced<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SearchScreen() {
  const { t } = useTranslation(["customer", "common"]);
  const td = useDataText();
  const { service } = Route.useSearch();

  const initialServiceName = useMemo(() => {
    if (!service) return "";
    const matched = quickServices.find(
      (s) => s.id.toLowerCase() === service.toLowerCase() || s.name === service,
    );
    return matched ? td(matched.name) : service;
  }, [service, td]);

  const [query, setQuery] = useState(initialServiceName);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [region, setRegion] = useState<string>(REGIONS[0]);
  const [maxPrice, setMaxPrice] = useState(2000000);
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(50);
  const [openNow, setOpenNow] = useState(false);
  const [vehicle, setVehicle] = useState(vehicleTypes[0]);
  const [serviceType, setServiceType] = useState(service ?? "Any");
  const [sort, setSort] = useState(sorts[0]);

  const { coords: userCoords } = useUserLocation();

  useEffect(() => {
    if (initialServiceName) {
      setQuery(initialServiceName);
      setServiceType(service ?? "Any");
    }
  }, [initialServiceName, service]);

  const debouncedQuery = useDebounced(query);
  const isPriceUncapped = maxPrice >= 2000000;

  const { data: page, isLoading } = useMasters({
    q: debouncedQuery || undefined,
    district: region !== REGIONS[0] ? region : undefined,
    service: serviceType !== "Any" && serviceType !== "other" ? serviceType : undefined,
    maxPrice: !isPriceUncapped ? maxPrice : undefined,
    minRating: minRating > 0 ? minRating : undefined,
    maxDistance: maxDistance < 50 ? maxDistance : undefined,
    lat: userCoords.lat,
    lng: userCoords.lng,
    sort: toApiSort(sort),
    perPage: 30,
  });

  const results = useMemo(() => {
    const list = (page?.items ?? []).map((m) => toUiMechanic(m, userCoords));
    const filtered = list.filter((m) => {
      if (openNow && !m.open) return false;
      if (vehicle !== "Any") {
        const supported =
          m.vehicleTypes.length > 0
            ? m.vehicleTypes
            : [
                "Yengil mashinalar",
                "Cobalt",
                "Gentra",
                "Nexia",
                "Spark",
                "Matiz",
                "Damas",
                "Tracker",
                "Malibu",
                "Onix",
                "Sedan",
                "SUV",
                "Chet el mashinalari",
              ];

        if (vehicle === "Yengil mashinalar") {
          const isPassenger = supported.some((v) =>
            [
              "Yengil mashinalar",
              "Cobalt",
              "Gentra",
              "Nexia",
              "Spark",
              "Matiz",
              "Sedan",
              "Hatchback",
            ].includes(v),
          );
          if (!isPassenger) return false;
        } else if (vehicle === "Yuk mashinalari") {
          const isTruck = supported.some((v) =>
            ["Yuk mashinalari", "Truck", "Labo", "Miniven"].includes(v),
          );
          if (!isTruck) return false;
        } else if (vehicle === "Chet el mashinalari") {
          const isForeign = supported.some((v) =>
            ["Chet el mashinalari", "Tracker", "Malibu", "SUV"].includes(v),
          );
          if (!isForeign) return false;
        } else {
          const matches =
            supported.includes(vehicle) ||
            (supported.includes("Yengil mashinalar") &&
              !["Yuk mashinalari", "Truck"].includes(vehicle));
          if (!matches) return false;
        }
      }
      if (maxDistance < 50 && m.distanceKm > maxDistance) return false;
      if (!isPriceUncapped && m.startingPrice > 0 && m.startingPrice > maxPrice) return false;
      return true;
    });

    if (sort === "Nearest") {
      return filtered.slice().sort((a, b) => a.distanceKm - b.distanceKm);
    }
    return filtered;
  }, [page, userCoords, openNow, vehicle, maxDistance, maxPrice, isPriceUncapped, sort]);

  const activeFilters =
    (region !== REGIONS[0] ? 1 : 0) +
    (!isPriceUncapped ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (maxDistance < 50 ? 1 : 0) +
    (openNow ? 1 : 0) +
    (vehicle !== "Any" ? 1 : 0) +
    (serviceType !== "Any" ? 1 : 0);

  const reset = () => {
    setRegion(REGIONS[0]);
    setMaxPrice(2000000);
    setMinRating(0);
    setMaxDistance(50);
    setOpenNow(false);
    setVehicle("Any");
    setServiceType("Any");
    setSort(sorts[0]);
  };

  return (
    <div className="space-y-5 pb-6">
      <header className="space-y-4 rounded-b-[2rem] bg-card px-5 pb-5 pt-8 card-elevated">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("search.title")}
        </h1>
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (serviceType !== "Any" && val !== initialServiceName) {
                setServiceType("Any");
              }
            }}
            placeholder={t("search.searchPlaceholder")}
            className="h-13 rounded-2xl border-border/70 bg-muted/60 pl-4 pr-10 text-[15px]"
          />
          {query ? (
            <button
              type="button"
              aria-label={t("search.clearSearch")}
              onClick={() => {
                setQuery("");
                setServiceType("Any");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-10 shrink-0 rounded-full">
                <SlidersHorizontal className="mr-1 h-4 w-4" />
                {t("search.filters")}
                {activeFilters ? (
                  <Badge className="ml-1.5 h-5 rounded-full px-1.5">{activeFilters}</Badge>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="mx-auto max-h-[85vh] max-w-[430px] overflow-y-auto rounded-t-3xl"
            >
              <SheetHeader className="px-1">
                <SheetTitle className="text-xl">{t("search.filtersTitle")}</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 px-1 pb-8 pt-2">
                <div className="space-y-2">
                  <Label>{t("search.location")}</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="h-11 rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r === "All regions"
                            ? t("search.any", { defaultValue: "Barcha hududlar" })
                            : r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>
                    {t("search.maxStartingPrice", {
                      price: isPriceUncapped ? "2 000 000+ so'm" : formatSom(maxPrice),
                    })}
                  </Label>
                  <Slider
                    value={[maxPrice]}
                    min={50000}
                    max={2000000}
                    step={50000}
                    onValueChange={([v]) => setMaxPrice(v)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>
                    {t("search.minimumRating", {
                      rating: minRating === 0 ? t("search.any") : `${minRating.toFixed(1)}+`,
                    })}
                  </Label>
                  <Slider
                    value={[minRating]}
                    min={0}
                    max={5}
                    step={0.5}
                    onValueChange={([v]) => setMinRating(v)}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>{t("search.distance", { distance: maxDistance })}</Label>
                    <span className="text-xs text-muted-foreground font-medium">
                      {maxDistance >= 50
                        ? t("search.allDistances", { defaultValue: "Barchasi" })
                        : `${maxDistance} km`}
                    </span>
                  </div>
                  <Slider
                    value={[maxDistance]}
                    min={1}
                    max={50}
                    step={1}
                    onValueChange={([v]) => setMaxDistance(v)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
                  <Label htmlFor="open-now">{t("search.openNow")}</Label>
                  <Switch id="open-now" checked={openNow} onCheckedChange={setOpenNow} />
                </div>

                <div className="space-y-2">
                  <Label>{t("search.vehicleType")}</Label>
                  <Select value={vehicle} onValueChange={setVehicle}>
                    <SelectTrigger className="h-11 rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((v, i) => (
                        <SelectItem key={v} value={v}>
                          {t(`search.vehicleTypes.${vehicleTypeKeys[i]}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("search.serviceType")}</Label>
                  <Select
                    value={serviceType}
                    onValueChange={(val) => {
                      setServiceType(val);
                      if (val !== "Any") {
                        if (val === "other") {
                          setQuery("");
                        } else {
                          const matched = quickServices.find((s) => s.id === val || s.name === val);
                          setQuery(matched ? td(matched.name) : val);
                        }
                      } else {
                        setQuery("");
                      }
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any">{t("search.any")}</SelectItem>
                      {quickServices.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {td(s.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="ghost" className="w-full rounded-2xl" onClick={reset}>
                  {t("search.resetAllFilters")}
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-10 rounded-full border-border/70">
              <ArrowUpDown className="mr-1 h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sorts.map((s, i) => (
                <SelectItem key={s} value={s}>
                  {t(`search.sorts.${sortKeys[i]}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="space-y-3 px-5">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? t("search.searching")
            : t("search.workshopsFound", { count: results.length })}
        </p>
        {isLoading ? (
          Array.from({ length: 4 }, (_, i) => <ListCardSkeleton key={i} />)
        ) : results.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={t("search.noWorkshops.title")}
            description={t("search.noWorkshops.description")}
            actionLabel={t("search.noWorkshops.action")}
            onAction={() => setIsFilterOpen(true)}
          />
        ) : (
          results.map((m) => <MechanicListCard key={m.id} mechanic={m} />)
        )}
      </div>
    </div>
  );
}
