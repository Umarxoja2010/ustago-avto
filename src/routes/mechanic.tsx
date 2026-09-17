import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { MechanicBottomNav } from "@/components/mechanic/MechanicBottomNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BrandLogo } from "@/components/BrandLogo";
import { useRoleGuard } from "@/lib/use-role-guard";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/mechanic")({
  ssr: false,
  head: () => ({
    meta: [
      { title: i18n.t("mechanic:head.title") },
      {
        name: "description",
        content: i18n.t("mechanic:head.description"),
      },
      { property: "og:title", content: i18n.t("mechanic:head.title") },
      {
        property: "og:description",
        content: i18n.t("mechanic:head.ogDescription"),
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MechanicLayout,
});

function MechanicLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { allowed } = useRoleGuard("mechanic");

  if (!allowed) return <div className="min-h-screen bg-app-canvas" />;

  return (
    <div className="min-h-screen bg-muted/40 md:py-8">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-app-canvas md:min-h-[860px] md:rounded-[2.5rem] md:border md:border-border md:shadow-float">
        <div className="sticky top-0 z-40 flex items-center justify-between bg-app-canvas/85 px-5 py-2.5 backdrop-blur border-b border-border/40">
          <BrandLogo size="sm" theme="auto" />
          <LanguageSwitcher compact />
        </div>
        <main key={pathname} className="animate-fade-in flex-1 pb-2">
          <Outlet />
        </main>
        <MechanicBottomNav />
      </div>
    </div>
  );
}
