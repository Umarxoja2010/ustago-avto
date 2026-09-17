import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Images,
  LifeBuoy,
  LogOut,
  MapPin,
  Phone,
  Star,
  Edit,
  Camera,
  Loader2,
  ExternalLink,
  Navigation,
} from "lucide-react";
import { LocationPickerDialog } from "@/components/LocationMapPicker";
import { PhoneNumbersManager } from "@/components/profile/PhoneNumbersManager";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { useDataText } from "@/lib/data-i18n";
import { useMasterProfile, useUpdateMasterProfile } from "@/lib/hooks/use-mechanic";

export const Route = createFileRoute("/mechanic/profile")({
  component: MechanicProfileScreen,
});

function MechanicProfileScreen() {
  const { t } = useTranslation(["mechanic", "auth", "common"]);
  const td = useDataText();
  const queryClient = useQueryClient();
  const { data: profile } = useMasterProfile();
  const updateProfile = useUpdateMasterProfile();
  const { user, signOut, updateUser } = useAuth();
  const navigate = useNavigate();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    workshopName: profile?.workshopName || "",
    about: profile?.about || "",
    address: profile?.address || "",
    lat: profile?.lat ?? 41.311081,
    lng: profile?.lng ?? 69.240562,
  });

  useEffect(() => {
    if (!isEditing) return;
    const onPopState = () => setIsEditing(false);
    window.history.pushState({ edit: true }, "");
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [isEditing]);

  const closeEditing = () => {
    if (typeof window !== "undefined" && window.history.state?.edit) {
      window.history.back();
    } else {
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (profile) {
      setEditForm({
        workshopName: profile.workshopName || "",
        about: profile.about || "",
        address: profile.address || "",
        lat: profile.lat ?? 41.311081,
        lng: profile.lng ?? 69.240562,
      });
    }
  }, [profile, user]);

  const handleUploadPhoto = async (type: "logo" | "cover", file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("profile.photoFailed"));
      return;
    }

    const formData = new FormData();
    formData.append(type, file);

    if (type === "logo") setIsUploadingLogo(true);
    else setIsUploadingCover(true);

    try {
      const res = await api.post<{ logo?: string; cover?: string }>("/master/photo", formData);
      await queryClient.invalidateQueries({ queryKey: ["master", "profile"] });
      if (type === "logo" && res?.logo) {
        updateUser({ avatar: res.logo });
      }
      toast.success(t("profile.photoSuccess"));
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? t(error.message, { defaultValue: error.message })
          : t("profile.photoFailed"),
      );
    } finally {
      if (type === "logo") setIsUploadingLogo(false);
      else setIsUploadingCover(false);
    }
  };

  // Backend only stores one `cover` image per workshop — no multi-image
  // gallery table exists (same gap as the customer-facing profile page).
  const gallery = profile?.cover ? [profile.cover] : [];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      updateProfile.mutate(
        {
          workshopName: editForm.workshopName,
          about: editForm.about,
          address: editForm.address,
          lat: editForm.lat,
          lng: editForm.lng,
        },
        {
          onSuccess: () => {
            toast.success(t("profile.updateSuccess"));
            closeEditing();
          },
          onError: (err) => {
            toast.error(
              err instanceof ApiError
                ? t(err.message, { defaultValue: err.message })
                : t("profile.updateFailed"),
            );
          },
        },
      );
    } catch (error) {
      toast.error(t("profile.updateFailed"));
    }
  };

  const coverUrl =
    profile?.cover ||
    "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=80";
  const logoUrl =
    profile?.logo ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.workshopName ?? "Shop")}&backgroundColor=16a34a&textColor=ffffff`;

  if (isEditing) {
    return (
      <div className="min-h-screen bg-background pb-12">
        {/* Hidden file inputs for logo and cover */}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUploadPhoto("logo", file);
            e.target.value = "";
          }}
        />
        <input
          ref={coverInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUploadPhoto("cover", file);
            e.target.value = "";
          }}
        />

        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-card/95 px-4 py-3.5 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeEditing}
              className="grid h-9 w-9 place-items-center rounded-full bg-muted transition-transform active:scale-90"
              aria-label={t("common:actions.back")}
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-base font-bold text-foreground">{t("profile.editProfile")}</h1>
              <p className="text-[11px] text-muted-foreground">
                {t("profile.editProfileDescription")}
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6 pt-4">
          {/* Photo upload section */}
          <div className="grid grid-cols-2 gap-3 px-5">
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-card p-3.5 text-center card-elevated">
              <p className="text-xs font-semibold text-foreground">{t("profile.logo")}</p>
              <div className="relative">
                <img
                  src={logoUrl}
                  alt=""
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-primary/20"
                />
                {isUploadingLogo && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploadingLogo}
                onClick={() => logoInputRef.current?.click()}
                className="mt-1 h-7 gap-1 rounded-full px-2.5 text-[11px]"
              >
                <Camera className="h-3 w-3 text-primary" />
                {isUploadingLogo ? t("profile.uploadingPhoto") : t("profile.changeLogo")}
              </Button>
            </div>

            <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-card p-3.5 text-center card-elevated">
              <p className="text-xs font-semibold text-foreground">{t("profile.cover")}</p>
              <div className="relative h-16 w-full overflow-hidden rounded-xl">
                <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                {isUploadingCover && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploadingCover}
                onClick={() => coverInputRef.current?.click()}
                className="mt-1 h-7 gap-1 rounded-full px-2.5 text-[11px]"
              >
                <Camera className="h-3 w-3 text-primary" />
                {isUploadingCover ? t("profile.uploadingPhoto") : t("profile.changeCover")}
              </Button>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5 px-5">
            <div className="space-y-4 rounded-3xl border border-border/70 bg-card p-4 card-elevated">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-workshopName"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  {t("profile.workshopName")}
                </Label>
                <Input
                  id="edit-workshopName"
                  value={editForm.workshopName}
                  onChange={(e) => setEditForm({ ...editForm, workshopName: e.target.value })}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-about" className="text-xs font-semibold text-muted-foreground">
                  {t("profile.about")}
                </Label>
                <Textarea
                  id="edit-about"
                  rows={3}
                  value={editForm.about}
                  onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-address"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  {t("profile.address")}
                </Label>
                <Input
                  id="edit-address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              {/* Ustaxona xaritasi va koordinatalar */}
              <div className="space-y-2.5 rounded-2xl border border-border/80 bg-muted/40 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      {t("profile.workshopLocation")}
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${editForm.lat},${editForm.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMapPickerOpen(true)}
                    className="h-8 gap-1.5 rounded-xl border-primary/30 text-xs text-primary hover:bg-primary/5"
                  >
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{t("profile.changeOnMap")}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        toast.error(t("auth:register.geolocationNotSupported"));
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const lat = Number(pos.coords.latitude.toFixed(6));
                          const lng = Number(pos.coords.longitude.toFixed(6));
                          setEditForm((f) => ({ ...f, lat, lng }));
                          toast.success(t("auth:register.geolocationSuccess"));
                        },
                        () => toast.error(t("auth:register.geolocationError")),
                        { enableHighAccuracy: true, timeout: 8000 },
                      );
                    }}
                    className="h-8 gap-1.5 rounded-xl text-xs"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>{t("profile.useCurrentLocation")}</span>
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background px-2.5 py-1.5 text-[11px] text-muted-foreground">
                  <span>{t("profile.coordinates")}:</span>
                  <span className="font-mono font-medium text-primary">
                    {editForm.lat.toFixed(5)}, {editForm.lng.toFixed(5)}
                  </span>
                </div>
              </div>
            </div>

            {/* Telefon raqamlarni boshqarish (1/3, 14 kunlik xavfsizlik) */}
            <PhoneNumbersManager />

            {/* Saqlash tugmasi */}
            <div className="space-y-2.5 pt-2">
              <Button
                type="submit"
                disabled={updateProfile.isPending || isUploadingLogo || isUploadingCover}
                className="h-12 w-full rounded-2xl text-sm font-semibold shadow-md shadow-primary/20"
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common:actions.saving")}
                  </>
                ) : (
                  t("common:actions.save")
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={closeEditing}
                className="h-11 w-full rounded-2xl text-xs text-muted-foreground"
              >
                {t("common:actions.cancel")}
              </Button>
            </div>
          </form>
        </div>

        <LocationPickerDialog
          open={mapPickerOpen}
          onOpenChange={setMapPickerOpen}
          initialCoords={{ lat: editForm.lat, lng: editForm.lng }}
          initialAddress={editForm.address}
          onConfirm={(coords, address) => {
            setEditForm((f) => ({
              ...f,
              lat: coords.lat,
              lng: coords.lng,
              address: address || f.address,
            }));
            toast.success(t("profile.locationSelected"));
          }}
        />
      </div>
    );
  }

  const links = [
    { to: "/mechanic/reviews", label: t("profile.links.reviews"), icon: Star },
    { to: "/mechanic/schedule", label: t("profile.links.schedule"), icon: CalendarDays },
  ] as const;

  return (
    <div className="space-y-5 pb-6">
      {/* Hidden file inputs for logo and cover */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUploadPhoto("logo", file);
          e.target.value = "";
        }}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUploadPhoto("cover", file);
          e.target.value = "";
        }}
      />

      <header className="overflow-hidden rounded-b-[2rem] bg-card card-elevated">
        <div className="relative h-44 sm:h-52 group">
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={isUploadingCover}
            aria-label={t("profile.changeCover")}
            className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-black/80 active:scale-95 transition-all"
          >
            {isUploadingCover ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
            <span>{isUploadingCover ? t("profile.uploadingPhoto") : t("profile.changeCover")}</span>
          </button>
        </div>
        <div className="px-5 pb-5 pt-0">
          <div className="flex items-end justify-between -mt-12 mb-3.5">
            <div className="relative group shrink-0">
              <img
                src={logoUrl}
                alt=""
                className="h-24 w-24 rounded-3xl border-4 border-card bg-card object-cover shadow-md ring-1 ring-border/30"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
                aria-label={t("profile.changeLogo")}
                className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-md hover:scale-105 active:scale-95 transition-transform"
              >
                {isUploadingLogo ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-9 gap-1.5 rounded-full border-border/80 px-3.5 text-xs font-medium hover:bg-muted/80"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>{t("profile.editWorkshop", { defaultValue: "Tahrirlash" })}</span>
            </Button>

            <LocationPickerDialog
              open={mapPickerOpen}
              onOpenChange={setMapPickerOpen}
              initialCoords={{ lat: editForm.lat, lng: editForm.lng }}
              initialAddress={editForm.address}
              onConfirm={(c, addr) => {
                setEditForm((f) => ({
                  ...f,
                  lat: c.lat,
                  lng: c.lng,
                  ...(addr ? { address: addr } : {}),
                }));
                toast.success(t("profile.locationUpdated"));
              }}
            />
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {profile?.workshopName}
              </h1>
              {profile?.verificationStatus === "verified" ? (
                <BadgeCheck className="h-5 w-5 shrink-0 text-primary" />
              ) : null}
            </div>
            {profile?.about ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{td(profile.about)}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-muted-foreground">
              {profile?.address ? (
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> {profile?.address}
                </p>
              ) : null}
              {user?.phone ? (
                <p className="flex items-center gap-1.5 font-mono">
                  <Phone className="h-3.5 w-3.5 text-primary shrink-0" /> {user?.phone}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[
              [t("profile.stats.rating"), (profile?.rating ?? 0).toFixed(1)],
              [t("profile.stats.reviews"), String(profile?.reviewCount ?? 0)],
              [
                t("profile.stats.experience"),
                t("profile.stats.years", { count: profile?.experienceYears ?? 0 }),
              ],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-muted px-2 py-3">
                <p className="text-base font-semibold text-foreground">{value}</p>
                <p className="text-[11px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="px-5">
        <div className="flex items-center justify-between rounded-3xl border border-border/70 bg-card p-4 card-elevated">
          <div>
            <p className="text-sm font-semibold text-foreground">{t("profile.acceptingJobs")}</p>
            <p className="text-xs text-muted-foreground">{t("profile.toggleAvailability")}</p>
          </div>
          <Switch
            checked={profile?.isOpen ?? true}
            disabled={updateProfile.isPending}
            onCheckedChange={(v) =>
              updateProfile.mutate(
                { isOpen: v },
                {
                  onError: (err) =>
                    toast.error(
                      err instanceof ApiError ? t(err.message, { defaultValue: err.message }) : "",
                    ),
                },
              )
            }
          />
        </div>
      </section>

      {/* Ustaxona joylashuvi xaritasi */}
      <section className="space-y-3 px-5">
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card card-elevated">
          <div className="flex items-center justify-between p-4 pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                {t("profile.workshopLocation")}
              </h2>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${profile?.lat ?? 41.311081},${profile?.lng ?? 69.240562}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
            >
              <span>Google Maps</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="relative h-44 w-full">
            <iframe
              title="Ustaxona joylashuv xaritasi"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://maps.google.com/maps?q=${profile?.lat ?? 41.311081},${profile?.lng ?? 69.240562}&z=15&output=embed`}
            />
          </div>
          <div className="p-3.5 flex items-center justify-between text-xs bg-muted/30">
            <div className="min-w-0 pr-2">
              <p className="text-foreground font-medium truncate">{profile?.address || "—"}</p>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                {(profile?.lat ?? 41.311081).toFixed(5)}, {(profile?.lng ?? 69.240562).toFixed(5)}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(true);
                setMapPickerOpen(true);
              }}
              className="h-8 text-xs rounded-xl gap-1 border-primary/30 text-primary shrink-0"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>{t("common:actions.edit")}</span>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3 px-5">
        <h2 className="flex items-center gap-1.5 text-[17px] font-semibold tracking-tight text-foreground">
          <Images className="h-4.5 w-4.5 text-primary" /> {t("profile.gallery")}
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {gallery.map((src) => (
            <img
              key={src}
              src={src}
              alt={t("profile.galleryAlt")}
              loading="lazy"
              className="aspect-square w-full rounded-2xl object-cover"
            />
          ))}
        </div>
      </section>

      <section className="px-5">
        <div className="divide-y divide-border/70 overflow-hidden rounded-3xl border border-border/70 bg-card card-elevated">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="flex items-center gap-3 px-4 py-4">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/10 text-primary">
                <l.icon className="h-4.5 w-4.5" />
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">{l.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
          <div className="flex items-center gap-3 px-4 py-4">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/10 text-primary">
              <LifeBuoy className="h-4.5 w-4.5" />
            </span>
            <span className="flex-1 text-sm font-medium text-foreground">
              {t("profile.language")}
            </span>
            <LanguageSwitcher />
          </div>
          <button
            type="button"
            onClick={() => toast(t("profile.supportToast"))}
            className="flex w-full items-center gap-3 px-4 py-4 text-left"
          >
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/10 text-primary">
              <LifeBuoy className="h-4.5 w-4.5" />
            </span>
            <span className="flex-1 text-sm font-medium text-foreground">
              {t("profile.links.help")}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </section>

      <div className="px-5">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="h-12 w-full rounded-2xl text-destructive">
              <LogOut className="mr-1 h-5 w-5" /> {t("profile.logOut")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[350px] rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("profile.logOutConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("profile.logOutConfirmBody")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">
                {t("common:actions.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                className="rounded-xl"
                onClick={() => {
                  signOut();
                  navigate({ to: "/login", replace: true });
                }}
              >
                {t("profile.logOut")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
