import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { EmptyState } from "@/components/customer/EmptyState";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toUiVehicle } from "@/lib/api-adapters";
import { ApiError } from "@/lib/api-client";
import { useDataText } from "@/lib/data-i18n";
import { useCreateVehicle, useDeleteVehicle, useVehicles } from "@/lib/hooks/use-vehicles";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/app/vehicles")({
  head: () => ({
    meta: [
      { title: i18n.t("customer:head.vehicles.title") },
      {
        name: "description",
        content: i18n.t("customer:head.vehicles.description"),
      },
      { property: "og:title", content: i18n.t("customer:head.vehicles.title") },
      { property: "og:description", content: i18n.t("customer:head.vehicles.ogDescription") },
    ],
  }),
  component: VehiclesScreen,
});

const empty = { brand: "", model: "", year: "", engine: "", plate: "", color: "" };

function VehiclesScreen() {
  const { t } = useTranslation("customer");
  const td = useDataText();
  const { data: apiVehicles } = useVehicles();
  const vehicles = (apiVehicles ?? []).map(toUiVehicle);
  const createVehicle = useCreateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand || !form.model) {
      toast.error(t("vehicles.validation"));
      return;
    }
    createVehicle.mutate(form, {
      onSuccess: () => {
        setForm(empty);
        setOpen(false);
        toast.success(t("vehicles.addSuccess"));
      },
      onError: (err) => {
        toast.error(
          err instanceof ApiError
            ? t(err.message, { defaultValue: err.message })
            : t("vehicles.validation"),
        );
      },
    });
  };

  const fields: [keyof typeof empty, string, string][] = [
    ["brand", t("vehicles.fields.brand"), "Chevrolet"],
    ["model", t("vehicles.fields.model"), "Malibu 2"],
    ["year", t("vehicles.fields.year"), "2022"],
    ["engine", t("vehicles.fields.engine"), "1.5 Turbo"],
    ["plate", t("vehicles.fields.plate"), "01 A 777 BA"],
    ["color", t("vehicles.fields.color"), "Black"],
  ];

  return (
    <div className="space-y-5 pb-6">
      <header className="flex items-center gap-3 rounded-b-[2rem] bg-card px-5 pb-5 pt-8 card-elevated">
        <Link
          to="/app/profile"
          aria-label={t("vehicles.backAria")}
          className="grid h-10 w-10 place-items-center rounded-full bg-muted transition-transform active:scale-90"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex-1 text-2xl font-semibold tracking-tight text-foreground">
          {t("vehicles.title")}
        </h1>
        <Button size="sm" className="rounded-full" onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> {t("vehicles.add")}
        </Button>
      </header>

      <div className="space-y-3 px-5">
        {vehicles.length === 0 ? (
          <EmptyState
            icon={Car}
            title={t("vehicles.noVehicles.title")}
            description={t("vehicles.noVehicles.description")}
            actionLabel={t("vehicles.noVehicles.action")}
            onAction={() => setOpen(true)}
          />
        ) : (
          vehicles.map((v) => (
            <article
              key={v.id}
              className="flex gap-3 rounded-3xl border border-border/70 bg-card p-4 card-elevated"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Car className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[15px] font-semibold text-foreground">
                  {v.brand} {v.model}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {[v.year, v.engine, td(v.color)].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1.5 inline-block rounded-lg bg-muted px-2 py-1 text-[11px] font-semibold tracking-wide text-foreground">
                  {v.plate || t("vehicles.noPlate")}
                </p>
              </div>
              <button
                type="button"
                aria-label={t("vehicles.removeAria", { brand: v.brand, model: v.model })}
                disabled={deleteVehicle.isPending}
                onClick={() => {
                  deleteVehicle.mutate(Number(v.id), {
                    onSuccess: () => toast.success(t("vehicles.removeSuccess")),
                    onError: () => toast.error(t("vehicles.validation")),
                  });
                }}
                className="grid h-9 w-9 shrink-0 place-items-center self-start rounded-full bg-muted text-muted-foreground transition-transform active:scale-90"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </article>
          ))
        )}
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="mx-auto max-w-[430px] rounded-t-3xl">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-xl">{t("vehicles.addTitle")}</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={submit} className="grid grid-cols-2 gap-3 p-4 pb-8">
            {fields.map(([key, label, placeholder]) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key} className="text-xs">
                  {label}
                </Label>
                <Input
                  id={key}
                  value={form[key]}
                  placeholder={placeholder}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="h-11 rounded-2xl"
                />
              </div>
            ))}
            <Button
              type="submit"
              className="col-span-2 mt-2 h-12 rounded-2xl text-base"
              disabled={createVehicle.isPending}
            >
              {t("vehicles.saveVehicle")}
            </Button>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
