import { createFileRoute } from "@tanstack/react-router";
import { Banknote, Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { formatSom } from "@/lib/customer-data";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api-client";
import { useDataText } from "@/lib/data-i18n";
import { useServiceCatalog } from "@/lib/hooks/use-masters";
import {
  useCreateMasterService,
  useDeleteMasterService,
  useMasterServicesMine,
  useUpdateMasterService,
} from "@/lib/hooks/use-mechanic";
import type { ApiMasterService } from "@/lib/api-types";

export const Route = createFileRoute("/mechanic/services")({
  component: ServicesScreen,
});

const POPULAR_SUGGESTIONS = [
  "Dvigatel ta'miri",
  "Moy almashtirish",
  "Tormoz tizimi",
  "Kompyuter diagnostika",
  "Shinamontaj",
  "Konditsioner xizmati",
  "Xodovoy ta'miri",
  "Elektr va signalizatsiya",
  "Akkumulyator almashtirish",
  "Kuzov ishlari",
  "Avtoyuvish & Detailing",
];

function ServicesScreen() {
  const { t } = useTranslation("mechanic");
  const td = useDataText();
  const { data: myServices } = useMasterServicesMine();
  const { data: catalog } = useServiceCatalog();
  const createService = useCreateMasterService();
  const updateService = useUpdateMasterService();
  const deleteService = useDeleteMasterService();

  const [editing, setEditing] = useState<ApiMasterService | null>(null);
  const [open, setOpen] = useState(false);
  const [useCustomName, setUseCustomName] = useState(false);
  const [catalogServiceId, setCatalogServiceId] = useState<string>("");
  const [customName, setCustomName] = useState("");
  const [form, setForm] = useState({ duration: "", price: "" });

  const services = myServices ?? [];
  const takenServiceIds = new Set(services.map((s) => s.serviceId));
  const availableCatalog = (catalog ?? []).filter((c) => !takenServiceIds.has(c.id));

  const onError = (err: unknown) => {
    if (err instanceof ApiError) {
      const fieldMsg =
        err.fieldError("serviceId") ||
        err.fieldError("name") ||
        err.fieldError("price");
      if (fieldMsg) {
        toast.error(fieldMsg);
        return;
      }
      toast.error(t(err.message, { defaultValue: err.message }));
      return;
    }
    toast.error("Xatolik yuz berdi");
  };

  const startAdd = () => {
    setEditing(null);
    setCatalogServiceId("");
    setCustomName("");
    setUseCustomName(availableCatalog.length === 0);
    setForm({ duration: "", price: "" });
    setOpen(true);
  };

  const startEdit = (s: ApiMasterService) => {
    setEditing(s);
    setForm({
      duration: s.duration ?? "",
      price: s.price != null ? String(s.price) : "",
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = form.duration.trim() || undefined;
    const cleanPrice = form.price.trim().replace(/\D/g, "");
    const price = cleanPrice !== "" ? Number(cleanPrice) : undefined;

    if (editing) {
      updateService.mutate(
        { id: editing.id, duration, price },
        {
          onSuccess: () => {
            toast.success(t("services.serviceUpdated"));
            setOpen(false);
          },
          onError,
        },
      );
      return;
    }

    if (useCustomName || availableCatalog.length === 0) {
      const name = customName.trim();
      if (!name) {
        toast.error("Xizmat nomini kiriting");
        return;
      }
      createService.mutate(
        { name, duration, price },
        {
          onSuccess: () => {
            toast.success(t("services.serviceAdded"));
            setOpen(false);
          },
          onError,
        },
      );
      return;
    }

    if (!catalogServiceId) {
      toast.error("Xizmatni tanlang");
      return;
    }

    createService.mutate(
      { serviceId: Number(catalogServiceId), duration, price },
      {
        onSuccess: () => {
          toast.success(t("services.serviceAdded"));
          setOpen(false);
        },
        onError,
      },
    );
  };

  const canSubmit = editing
    ? true
    : useCustomName || availableCatalog.length === 0
      ? customName.trim().length > 0
      : Boolean(catalogServiceId);

  return (
    <div className="space-y-5 pb-6">
      <header className="rounded-b-[2rem] bg-card px-5 pb-5 pt-8 card-elevated">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("services.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("services.subtitle")}</p>
      </header>

      <div className="space-y-3 px-5">
        {services.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-6 text-center">
            <p className="text-sm font-medium text-foreground">Hozircha xizmatlar qo'shilmagan</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pastdagi tugmani bosib mijozlar ko'rishi va band qilishi mumkin bo'lgan xizmatlaringizni qo'shing
            </p>
          </div>
        )}

        {services.map((s) => (
          <article
            key={s.id}
            className="animate-fade-in rounded-3xl border border-border/70 bg-card p-4 card-elevated"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-foreground">
                  {td(s.name ?? "")}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {s.duration ? (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" /> {td(s.duration)}
                    </span>
                  ) : null}
                  <span className="font-semibold text-primary">
                    {s.price != null
                      ? formatSom(s.price)
                      : t("services.priceNegotiable", { defaultValue: "Kelishilgan" })}
                  </span>
                </div>
              </div>
              <Switch
                checked={s.active}
                onCheckedChange={(v) => updateService.mutate({ id: s.id, active: v }, { onError })}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="h-10 flex-1 rounded-2xl"
                onClick={() => startEdit(s)}
              >
                <Pencil className="mr-1 h-4 w-4" /> {t("services.edit")}
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-2xl text-destructive"
                onClick={() => {
                  deleteService.mutate(s.id, {
                    onSuccess: () => toast(t("services.serviceRemoved")),
                    onError,
                  });
                }}
                aria-label={t("services.deleteLabel", { name: td(s.name ?? "") })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </article>
        ))}
      </div>

      <div className="px-5">
        <Button
          className="h-12 w-full rounded-2xl text-base font-semibold shadow-sm"
          onClick={startAdd}
        >
          <Plus className="mr-1 h-5 w-5" /> {t("services.addService")}
        </Button>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="mx-auto max-w-[430px] rounded-t-3xl">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-xl">
              {editing ? t("services.editService") : t("services.newService")}
            </DrawerTitle>
          </DrawerHeader>
          <form onSubmit={submit} className="space-y-4 p-4 pb-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="svc-name">{t("services.serviceName")}</Label>
                {!editing && availableCatalog.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomName(!useCustomName);
                      setCatalogServiceId("");
                      setCustomName("");
                    }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {useCustomName ? t("services.chooseFromCatalog") : t("services.customService")}
                  </button>
                )}
              </div>

              {editing ? (
                <Input
                  id="svc-name"
                  className="h-12 rounded-2xl"
                  value={td(editing.name ?? "")}
                  disabled
                />
              ) : useCustomName || availableCatalog.length === 0 ? (
                <div className="space-y-2">
                  <Input
                    id="svc-name"
                    className="h-12 rounded-2xl"
                    placeholder={t("services.customNamePlaceholder")}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    autoFocus
                  />
                  <div className="pt-1">
                    <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                      {t("services.quickSuggestions")}
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {POPULAR_SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setCustomName(s)}
                          className={`rounded-xl px-2.5 py-1 text-xs transition-colors ${
                            customName === s
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Select value={catalogServiceId} onValueChange={setCatalogServiceId}>
                  <SelectTrigger id="svc-name" className="h-12 rounded-2xl">
                    <SelectValue placeholder={t("services.serviceName")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCatalog.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {td(c.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="svc-duration">{t("services.duration")}</Label>
              <Input
                id="svc-duration"
                className="h-12 rounded-2xl"
                placeholder={t("services.durationPlaceholder")}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="svc-price">
                  {t("services.price", { defaultValue: "Xizmat narxi (so'm)" })}
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {t("services.priceNegotiable", { defaultValue: "Kelishilgan" })}
                </span>
              </div>
              <div className="relative">
                <Input
                  id="svc-price"
                  type="number"
                  min="0"
                  step="5000"
                  className="h-12 rounded-2xl pr-16"
                  placeholder={t("services.pricePlaceholder", {
                    defaultValue: "Masalan: 150000",
                  })}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-semibold text-muted-foreground">
                  so'm
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t("services.priceHint", {
                  defaultValue: "Ixtiyoriy. Bo'sh qoldirilsa «Kelishilgan» deb ko'rsatiladi.",
                })}
              </p>
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-2xl text-base font-semibold"
              disabled={createService.isPending || updateService.isPending || !canSubmit}
            >
              {editing ? t("common:actions.saveChanges") : t("services.addService")}
            </Button>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
