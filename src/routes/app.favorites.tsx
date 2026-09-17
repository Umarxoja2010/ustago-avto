import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/customer/EmptyState";
import { MechanicListCard } from "@/components/customer/MechanicCard";
import { ServiceIcon } from "@/components/customer/ServiceIcon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toUiMechanic } from "@/lib/api-adapters";
import { formatSom, quickServices } from "@/lib/customer-data";
import { useDataText } from "@/lib/data-i18n";
import { useCustomerStore } from "@/lib/customer-store";
import { useFavorites } from "@/lib/hooks/use-favorites";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/app/favorites")({
  head: () => ({
    meta: [
      { title: i18n.t("customer:head.favorites.title") },
      {
        name: "description",
        content: i18n.t("customer:head.favorites.description"),
      },
      { property: "og:title", content: i18n.t("customer:head.favorites.title") },
      { property: "og:description", content: i18n.t("customer:head.favorites.ogDescription") },
    ],
  }),
  component: FavoritesScreen,
});

function FavoritesScreen() {
  const { t } = useTranslation("customer");
  const td = useDataText();
  const { favoriteServices, toggleService } = useCustomerStore();
  const { data: apiFavorites } = useFavorites();
  const savedMechanics = (apiFavorites ?? []).map(toUiMechanic);
  const savedServices = quickServices.filter((s) => favoriteServices.includes(s.id));

  return (
    <div className="space-y-5 pb-6">
      <header className="rounded-b-[2rem] bg-card px-5 pb-5 pt-8 card-elevated">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("favorites.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("favorites.subtitle")}</p>
      </header>

      <Tabs defaultValue="mechanics" className="px-5">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl">
          <TabsTrigger value="mechanics" className="rounded-xl text-xs">
            {t("favorites.tabs.mechanics", { count: savedMechanics.length })}
          </TabsTrigger>
          <TabsTrigger value="services" className="rounded-xl text-xs">
            {t("favorites.tabs.services", { count: savedServices.length })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mechanics" className="mt-4 space-y-3">
          {savedMechanics.length === 0 ? (
            <EmptyState
              icon={HeartOff}
              title={t("favorites.noWorkshops.title")}
              description={t("favorites.noWorkshops.description")}
            />
          ) : (
            savedMechanics.map((m) => <MechanicListCard key={m.id} mechanic={m} />)
          )}
        </TabsContent>

        <TabsContent value="services" className="mt-4 space-y-3">
          {savedServices.length === 0 ? (
            <EmptyState
              icon={HeartOff}
              title={t("favorites.noServices.title")}
              description={t("favorites.noServices.description")}
            />
          ) : (
            savedServices.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-3xl border border-border/70 bg-card p-3.5 card-elevated"
              >
                <ServiceIcon icon={s.icon} color={s.color} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{td(s.name)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("favorites.from", { price: formatSom(s.from) })}
                  </p>
                </div>
                <Link
                  to="/app/search"
                  search={{ service: s.name }}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform active:scale-95"
                >
                  {t("favorites.book")}
                </Link>
                <button
                  type="button"
                  aria-label={t("favorites.removeAria", { name: s.name })}
                  onClick={() => toggleService(s.id)}
                  className="text-xs font-medium text-muted-foreground"
                >
                  {t("favorites.remove")}
                </button>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
