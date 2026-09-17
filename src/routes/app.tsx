import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { LifeBuoy, PhoneCall, Wrench } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { BottomNav } from "@/components/customer/BottomNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import i18n from "@/lib/i18n";
import { CustomerStoreProvider } from "@/lib/customer-store";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/app")({
  ssr: false,
  head: () => ({
    meta: [
      { title: i18n.t("customer:head.app.title") },
      {
        name: "description",
        content: i18n.t("customer:head.app.description"),
      },
      { property: "og:title", content: i18n.t("customer:head.app.title") },
      {
        property: "og:description",
        content: i18n.t("customer:head.app.ogDescription"),
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomerAppLayout,
});

function CustomerAppLayout() {
  const { t } = useTranslation(["customer", "common"]);
  const [sos, setSos] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { allowed } = useRoleGuard("customer");

  if (!allowed) {
    return <div className="min-h-screen bg-app-canvas" />;
  }

  return (
    <CustomerStoreProvider>
      <div className="min-h-screen bg-muted/40 md:py-8">
        <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-app-canvas md:min-h-[860px] md:rounded-[2.5rem] md:border md:border-border md:shadow-float">
          <div className="sticky top-0 z-40 flex justify-end bg-app-canvas/85 px-5 py-2 backdrop-blur">
            <LanguageSwitcher compact />
          </div>
          <main key={pathname} className="animate-fade-in flex-1 pb-2">
            <Outlet />
          </main>

          <div className="sticky bottom-20 z-40 flex justify-end px-5">
            <button
              type="button"
              onClick={() => setSos(true)}
              aria-label={t("customer:layout.sosAria")}
              className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-fab transition-transform duration-200 active:scale-90"
            >
              <LifeBuoy className="h-6 w-6" />
            </button>
          </div>

          <BottomNav />
        </div>
      </div>

      <Drawer open={sos} onOpenChange={setSos}>
        <DrawerContent className="mx-auto max-w-[430px] rounded-t-3xl">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-xl">{t("customer:layout.sosTitle")}</DrawerTitle>
            <DrawerDescription>{t("customer:layout.sosDescription")}</DrawerDescription>
          </DrawerHeader>
          <div className="space-y-3 p-4 pb-8">
            <Button
              className="h-12 w-full rounded-2xl text-base"
              onClick={() => {
                setSos(false);
                toast.success(t("customer:layout.mobileMechanicRequested"), {
                  description: t("customer:layout.mobileMechanicDescription"),
                });
              }}
            >
              <Wrench className="mr-1 h-5 w-5" /> {t("customer:layout.requestMobileMechanic")}
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full rounded-2xl text-base"
              onClick={() => {
                setSos(false);
                toast(t("customer:layout.callingSupportToast"));
              }}
            >
              <PhoneCall className="mr-1 h-5 w-5" /> {t("customer:layout.callSupport")}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </CustomerStoreProvider>
  );
}
