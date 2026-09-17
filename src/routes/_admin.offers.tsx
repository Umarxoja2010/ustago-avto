import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  ExternalLink,
  Layers,
  Pencil,
  Plus,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api-client";
import type { ApiSpecialOffer } from "@/lib/api-types";
import {
  useAdminOffers,
  useCreateOffer,
  useDeleteOffer,
  useToggleOffer,
  useUpdateOffer,
  type OfferFormData,
} from "@/lib/hooks/use-offers";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/offers")({
  head: () => ({
    meta: [
      {
        title: `${i18n.t("admin:offers.title", { defaultValue: "Maxsus takliflar" })} — UstaGo Avto Admin`,
      },
      {
        name: "description",
        content: i18n.t("admin:offers.description", { defaultValue: "Aksiyalarni boshqarish" }),
      },
      {
        property: "og:title",
        content: `${i18n.t("admin:offers.title", { defaultValue: "Maxsus takliflar" })} — UstaGo Avto Admin`,
      },
    ],
  }),
  component: OffersPage,
});

const ACCENT_PRESETS = [
  { value: "from-amber-600 to-orange-700", label: "Olovrang / Apelsin (Amber & Orange)" },
  { value: "from-blue-600 to-indigo-700", label: "Moviy / To'q ko'k (Blue & Indigo)" },
  { value: "from-emerald-600 to-teal-700", label: "Zumrad / Yashil (Emerald & Teal)" },
  { value: "from-purple-600 to-pink-700", label: "Binafsha / Pushti (Purple & Pink)" },
  { value: "from-rose-600 to-red-800", label: "Qizil / Yoqut (Rose & Red)" },
  { value: "from-slate-800 to-zinc-900", label: "To'q kulrang / Qora (Slate & Zinc)" },
];

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80";

const INITIAL_FORM: OfferFormData = {
  title: "",
  subtitle: "",
  cta: "Batafsil",
  image: DEFAULT_IMAGE,
  link: "/search",
  badge: "-20%",
  accent: "from-amber-600 to-orange-700",
  is_active: true,
  sort_order: 0,
};

function OffersPage() {
  const { t } = useTranslation("admin");
  const { data: offers = [], isLoading } = useAdminOffers();
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();
  const toggleOffer = useToggleOffer();
  const deleteOffer = useDeleteOffer();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<OfferFormData>(INITIAL_FORM);

  const [deletingOffer, setDeletingOffer] = useState<ApiSpecialOffer | null>(null);

  const filteredOffers = offers.filter((o) => {
    const matchesSearch =
      !search ||
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      (o.badge && o.badge.toLowerCase().includes(search.toLowerCase())) ||
      (o.subtitle && o.subtitle.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && o.isActive) ||
      (statusFilter === "inactive" && !o.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      ...INITIAL_FORM,
      sort_order: offers.length + 1,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (offer: ApiSpecialOffer) => {
    setEditingId(offer.id);
    setFormData({
      title: offer.title,
      subtitle: offer.subtitle || "",
      cta: offer.cta || "Batafsil",
      image: offer.image,
      link: offer.link || "/search",
      badge: offer.badge || "",
      accent: offer.accent || "from-amber-600 to-orange-700",
      is_active: offer.isActive,
      sort_order: offer.sortOrder,
    });
    setDialogOpen(true);
  };

  const handleToggle = (offer: ApiSpecialOffer) => {
    toggleOffer.mutate(offer.id, {
      onSuccess: () => {
        toast.success(
          offer.isActive ? `${offer.title} faolsizlantirildi` : `${offer.title} faollashtirildi`,
        );
      },
      onError: (err) => {
        toast.error(
          err instanceof ApiError
            ? t(err.message, { defaultValue: err.message })
            : "Xatolik yuz berdi",
        );
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Sarlavha kiritilishi shart");
      return;
    }
    if (!formData.image.trim()) {
      toast.error("Rasm havolasi kiritilishi shart");
      return;
    }

    if (editingId) {
      updateOffer.mutate(
        { id: editingId, data: formData },
        {
          onSuccess: () => {
            toast.success(t("offers.saved", { defaultValue: "Taklif muvaffaqiyatli saqlandi" }));
            setDialogOpen(false);
          },
          onError: (err) => {
            toast.error(
              err instanceof ApiError ? t(err.message, { defaultValue: err.message }) : "Xatolik",
            );
          },
        },
      );
    } else {
      createOffer.mutate(formData, {
        onSuccess: () => {
          toast.success(t("offers.saved", { defaultValue: "Taklif muvaffaqiyatli saqlandi" }));
          setDialogOpen(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof ApiError ? t(err.message, { defaultValue: err.message }) : "Xatolik",
          );
        },
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingOffer) return;
    deleteOffer.mutate(deletingOffer.id, {
      onSuccess: () => {
        toast.success(t("offers.deleted", { defaultValue: "Taklif o'chirildi" }));
        setDeletingOffer(null);
      },
      onError: (err) => {
        toast.error(
          err instanceof ApiError ? t(err.message, { defaultValue: err.message }) : "Xatolik",
        );
      },
    });
  };

  const isSaving = createOffer.isPending || updateOffer.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("offers.title", { defaultValue: "Maxsus takliflar" })}
        description={t("offers.description", {
          defaultValue: "Bosh sahifadagi aksiya, chegirma va maxsus e'lonlarni boshqarish.",
        })}
        actions={
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("offers.addOffer", { defaultValue: "Yangi taklif qo'shish" })}
          </Button>
        }
      />

      {/* Toolbar filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Input
            placeholder="Qidirish (sarlavha, yorliq)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Barcha holatlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barchasi ({offers.length})</SelectItem>
              <SelectItem value="active">
                Faol ({offers.filter((o) => o.isActive).length})
              </SelectItem>
              <SelectItem value="inactive">
                Nofaol ({offers.filter((o) => !o.isActive).length})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={4} cols={6} />
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="p-8 flex flex-col items-center gap-4">
            <EmptyState
              icon={Tag}
              title={t("offers.empty", {
                defaultValue: "Hozircha hech qanday maxsus taklif mavjud emas.",
              })}
              description="Bosh sahifa karuselida mijozlarga chegirma yoki aksiyalarni ko'rsatish uchun yangi taklif qo'shing."
            />
            <Button onClick={handleOpenCreate} size="sm" className="gap-2 -mt-2">
              <Plus className="h-4 w-4" />
              {t("offers.addOffer", { defaultValue: "Yangi taklif qo'shish" })}
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">
                  {t("offers.table.image", { defaultValue: "Rasm" })}
                </TableHead>
                <TableHead className="w-24">
                  {t("offers.table.badge", { defaultValue: "Yorliq" })}
                </TableHead>
                <TableHead>
                  {t("offers.table.title", { defaultValue: "Sarlavha & Tavsif" })}
                </TableHead>
                <TableHead className="w-40">Havola / Tugma</TableHead>
                <TableHead className="w-24 text-center">
                  {t("offers.table.order", { defaultValue: "Tartib" })}
                </TableHead>
                <TableHead className="w-28 text-center">
                  {t("offers.table.status", { defaultValue: "Holat" })}
                </TableHead>
                <TableHead className="w-28 text-right">
                  {t("offers.table.actions", { defaultValue: "Amallar" })}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOffers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell>
                    <div className="relative h-12 w-16 overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={offer.image}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <div
                        className={cn("absolute inset-0 bg-gradient-to-r opacity-50", offer.accent)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {offer.badge ? (
                      <Badge variant="secondary" className="font-semibold">
                        {offer.badge}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{offer.title}</div>
                    {offer.subtitle ? (
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {offer.subtitle}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {offer.link || "/search"}
                    </div>
                    {offer.cta ? (
                      <span className="text-xs text-primary font-medium">[{offer.cta}]</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">{offer.sortOrder}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={offer.isActive}
                        onCheckedChange={() => handleToggle(offer)}
                        aria-label="Holatni almashtirish"
                      />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          offer.isActive ? "text-emerald-600" : "text-muted-foreground",
                        )}
                      >
                        {offer.isActive
                          ? t("offers.status.active", { defaultValue: "Faol" })
                          : t("offers.status.inactive", { defaultValue: "Nofaol" })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(offer)}
                        title={t("offers.editOffer", { defaultValue: "Tahrirlash" })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeletingOffer(offer)}
                        title={t("offers.deleteOffer", { defaultValue: "O'chirish" })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingId
                ? t("offers.editOffer", { defaultValue: "Taklifni tahrirlash" })
                : t("offers.addOffer", { defaultValue: "Yangi taklif qo'shish" })}
            </DialogTitle>
            <DialogDescription>
              Ushbu ma'lumotlar mijozlar bosh sahifasidagi asosiy banner karuselida aks etadi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Live Banner Preview */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Jonli ko'rinish (Live Preview)
              </Label>
              <div className="relative h-36 overflow-hidden rounded-2xl border shadow-inner">
                <img
                  src={formData.image || DEFAULT_IMAGE}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                  }}
                />
                <div
                  className={cn("absolute inset-0 bg-gradient-to-r opacity-90", formData.accent)}
                />
                {formData.badge ? (
                  <div className="absolute top-3 right-3 rounded-full bg-white/25 backdrop-blur-md px-2.5 py-0.5 text-xs font-bold text-white shadow">
                    {formData.badge}
                  </div>
                ) : null}
                <div className="absolute inset-0 flex flex-col justify-center gap-1 p-5 text-white">
                  <h3 className="max-w-[70%] text-lg font-bold leading-tight drop-shadow">
                    {formData.title || "Sarlavha namunasi"}
                  </h3>
                  <p className="max-w-[75%] text-xs text-white/90 drop-shadow line-clamp-2">
                    {formData.subtitle || "Qisqacha tavsif matni ushbu joyda joylashadi"}
                  </p>
                  <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-black/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                    {formData.cta || "Batafsil"}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="offer-title">
                  {t("offers.form.titleLabel", { defaultValue: "Sarlavha" })} *
                </Label>
                <Input
                  id="offer-title"
                  placeholder={t("offers.form.titlePlaceholder", {
                    defaultValue: "Masalan: Mavsumiy chegirma 20%",
                  })}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="offer-subtitle">
                  {t("offers.form.subtitleLabel", { defaultValue: "Qisqacha tavsif" })}
                </Label>
                <Textarea
                  id="offer-subtitle"
                  placeholder={t("offers.form.subtitlePlaceholder", {
                    defaultValue: "Barcha diagnostika xizmatlariga 20% gacha chegirma",
                  })}
                  rows={2}
                  value={formData.subtitle || ""}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer-badge">
                  {t("offers.form.badgeLabel", { defaultValue: "Yorliq (Badge)" })}
                </Label>
                <Input
                  id="offer-badge"
                  placeholder="-20%, Yangi, TOP"
                  value={formData.badge || ""}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer-cta">
                  {t("offers.form.ctaLabel", { defaultValue: "Tugma matni (CTA)" })}
                </Label>
                <Input
                  id="offer-cta"
                  placeholder="Batafsil, Band qilish"
                  value={formData.cta || ""}
                  onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="offer-image">
                  {t("offers.form.imageLabel", { defaultValue: "Rasm havolasi (URL)" })} *
                </Label>
                <Input
                  id="offer-image"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer-link">
                  {t("offers.form.linkLabel", { defaultValue: "Yo'naltirish havolasi" })}
                </Label>
                <Input
                  id="offer-link"
                  placeholder="/search yoki /bookings"
                  value={formData.link || ""}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer-accent">
                  {t("offers.form.accentLabel", { defaultValue: "Rang uslubi (Gradient)" })}
                </Label>
                <Select
                  value={formData.accent || ACCENT_PRESETS[0].value}
                  onValueChange={(val) => setFormData({ ...formData, accent: val })}
                >
                  <SelectTrigger id="offer-accent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCENT_PRESETS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer-order">
                  {t("offers.form.sortOrderLabel", { defaultValue: "Tartib raqami" })}
                </Label>
                <Input
                  id="offer-order"
                  type="number"
                  min="0"
                  value={formData.sort_order ?? 0}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-3 mt-1 sm:col-span-1">
                <div className="space-y-0.5">
                  <Label htmlFor="offer-active" className="cursor-pointer">
                    {t("offers.form.activeLabel", { defaultValue: "Faol (ko'rinsin)" })}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Mijozlar bosh sahifasida ko'rinishi
                  </p>
                </div>
                <Switch
                  id="offer-active"
                  checked={formData.is_active ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSaving}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingOffer}
        onOpenChange={(open) => !open && setDeletingOffer(null)}
        title={t("offers.deleteOffer", { defaultValue: "Taklifni o'chirish" })}
        description={`"${deletingOffer?.title}" taklifini o'chirishni tasdiqlaysizmi?`}
        confirmLabel="O'chirish"
        destructive
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
