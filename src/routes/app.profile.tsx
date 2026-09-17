import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronRight,
  Globe,
  History,
  Info,
  LifeBuoy,
  LogOut,
  Mail,
  Moon,
  Phone,
  Car,
  Edit,
  Camera,
  Loader2,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PhoneNumbersManager } from "@/components/profile/PhoneNumbersManager";
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
import { useCustomerStore } from "@/lib/customer-store";
import { useAuth } from "@/lib/auth";
import { useBookings } from "@/lib/hooks/use-bookings";
import { useVehicles } from "@/lib/hooks/use-vehicles";
import { useUserLocation } from "@/lib/hooks/use-user-location";
import { api, ApiError } from "@/lib/api-client";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: i18n.t("customer:head.profile.title") },
      {
        name: "description",
        content: i18n.t("customer:head.profile.description"),
      },
      { property: "og:title", content: i18n.t("customer:head.profile.title") },
      { property: "og:description", content: i18n.t("customer:head.profile.ogDescription") },
    ],
  }),
  component: ProfileScreen,
});

function Row({
  icon: Icon,
  label,
  value,
  to,
  onClick,
  right,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  to?: "/app/vehicles" | "/app/bookings";
  onClick?: () => void;
  right?: React.ReactNode;
}) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted text-foreground">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="flex-1 truncate text-sm font-medium text-foreground">{label}</span>
      {value ? <span className="truncate text-sm text-muted-foreground">{value}</span> : null}
      {right ??
        (to || onClick ? (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : null)}
    </div>
  );
  if (to)
    return (
      <Link to={to} className="block transition-colors active:bg-muted/60">
        {inner}
      </Link>
    );
  if (onClick)
    return (
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left transition-colors active:bg-muted/60"
      >
        {inner}
      </button>
    );
  return inner;
}

function Group({ children }: { children: React.ReactNode }) {
  return (
    <div className="divide-y divide-border/70 overflow-hidden rounded-3xl border border-border/70 bg-card card-elevated">
      {children}
    </div>
  );
}

function ProfileScreen() {
  const { t } = useTranslation("customer");
  const { darkMode, setDarkMode } = useCustomerStore();
  const navigate = useNavigate();
  const { user, signOut, updateUser, refreshUser } = useAuth();
  const { data: apiVehicles } = useVehicles();
  const { data: apiBookings } = useBookings();
  const { locationName, isRealGps } = useUserLocation();

  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);

  const cleanEmail = user?.email && !user.email.endsWith("@ustago.local") ? user.email : "";

  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    name: user?.name || "",
    email: cleanEmail,
  });
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
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

  React.useEffect(() => {
    setEditForm({
      name: user?.name || "",
      email: user?.email && !user.email.endsWith("@ustago.local") ? user.email : "",
    });
  }, [user]);

  const vehicleCount = Array.isArray(apiVehicles) ? apiVehicles.length : 0;
  const bookingCount =
    apiBookings?.meta?.total ??
    (Array.isArray(apiBookings) ? (apiBookings as unknown[]).length : 0);

  const avatarUrl =
    user?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name ?? "User")}&backgroundColor=16a34a&textColor=ffffff`;

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("profile.photoFailed"));
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setIsUploadingAvatar(true);
    try {
      const res = await api.post<{ avatar?: string }>("/user/avatar", formData);
      if (res?.avatar) {
        updateUser({ avatar: res.avatar });
      } else {
        await refreshUser();
      }
      toast.success(t("profile.photoSuccess"));
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? t(error.message, { defaultValue: error.message })
          : t("profile.photoFailed"),
      );
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.patch("/user", {
        name: editForm.name.trim(),
        email: editForm.email ? editForm.email.trim() : null,
      });
      updateUser({
        name: editForm.name.trim(),
        email: editForm.email ? editForm.email.trim() : null,
      });
      toast.success(t("profile.updateSuccess"));
      closeEditing();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? t(error.message, { defaultValue: error.message })
          : t("profile.updateFailed"),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (isEditing) {
    return (
      <div className="min-h-screen bg-background pb-12">
        {/* Hidden file input for avatar upload */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleAvatarFile}
        />

        {/* Dedicated mobile page top bar */}
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
          {/* Avatar upload */}
          <div className="flex flex-col items-center justify-center gap-3 py-2">
            <div className="relative">
              <img
                src={avatarUrl}
                alt=""
                className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20 shadow-md"
              />
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
              className="h-8 gap-1.5 rounded-full text-xs"
            >
              <Camera className="h-3.5 w-3.5 text-primary" />
              {isUploadingAvatar ? t("profile.uploadingPhoto") : t("profile.changePhoto")}
            </Button>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5 px-5">
            <div className="space-y-4 rounded-3xl border border-border/70 bg-card p-4 card-elevated">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-xs font-semibold text-muted-foreground">
                  {t("profile.fullName")}
                </Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-xs font-semibold text-muted-foreground">
                  {t("profile.email")}
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="example@mail.com"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            {/* Telefon raqamlarni boshqarish (1/3, 14 kunlik xavfsizlik) */}
            <PhoneNumbersManager />

            {/* Saqlash tugmasi */}
            <div className="space-y-2.5 pt-2">
              <Button
                type="submit"
                disabled={isUpdating || isUploadingAvatar}
                className="h-12 w-full rounded-2xl text-sm font-semibold shadow-md shadow-primary/20"
              >
                {isUpdating ? (
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
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Hidden file input for avatar upload */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleAvatarFile}
      />

      <header className="rounded-b-[2rem] bg-card px-5 pb-6 pt-8 card-elevated">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <img
              src={avatarUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              aria-label={t("profile.changePhoto")}
              className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm hover:scale-105 active:scale-95 transition-transform"
            >
              {isUploadingAvatar ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
              {user?.name ?? "Foydalanuvchi"}
            </h1>
            <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5" /> {user?.phone || "—"}
            </p>
            {cleanEmail ? (
              <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {cleanEmail}
              </p>
            ) : null}
            {locationName || user?.city || user?.region ? (
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">
                  {isRealGps && locationName
                    ? locationName
                    : locationName || user?.city || user?.region}
                </span>
                {isRealGps ? (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    (GPS)
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="h-9 w-9 rounded-full"
            aria-label={t("profile.editProfile")}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-3 text-center">
          <div>
            <p className="text-sm font-semibold text-foreground">{bookingCount}</p>
            <p className="text-[11px] text-muted-foreground">{t("profile.stats.bookings")}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{vehicleCount}</p>
            <p className="text-[11px] text-muted-foreground">{t("profile.stats.vehicles")}</p>
          </div>
        </div>
      </header>

      <div className="space-y-4 px-5">
        <Group>
          <Row
            icon={Car}
            label={t("profile.myVehicles")}
            value={t("profile.savedCount", { count: vehicleCount })}
            to="/app/vehicles"
          />
          <Row
            icon={History}
            label={t("profile.bookingHistory")}
            value={t("profile.totalCount", { count: bookingCount })}
            to="/app/bookings"
          />
        </Group>

        <Group>
          <Row
            icon={Globe}
            label={t("profile.language")}
            right={
              <LanguageSwitcher
                className="h-9 w-[130px] rounded-full border-border/70 text-xs"
                showIcon={false}
              />
            }
          />
          <Row
            icon={Moon}
            label={t("profile.darkMode")}
            right={
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                aria-label={t("profile.toggleDarkMode")}
              />
            }
          />
        </Group>

        <Group>
          <Row
            icon={LifeBuoy}
            label={t("profile.support")}
            value={t("profile.supportValue")}
            onClick={() => toast(t("profile.supportOpening"))}
          />
          <Row
            icon={Info}
            label={t("profile.about")}
            value={t("profile.aboutValue")}
            onClick={() => toast(t("profile.aboutToast"))}
          />
        </Group>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="h-12 w-full rounded-2xl text-destructive">
              <LogOut className="mr-1.5 h-4 w-4" /> {t("profile.logout")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("profile.logoutDialog.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("profile.logoutDialog.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full">
                {t("profile.logoutDialog.stay")}
              </AlertDialogCancel>
              <AlertDialogAction
                className="rounded-full"
                onClick={() => {
                  signOut();
                  toast.success(t("profile.logoutSuccess"));
                  navigate({ to: "/login", replace: true });
                }}
              >
                {t("profile.logoutDialog.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="pb-2 text-center text-[11px] text-muted-foreground">{t("profile.footer")}</p>
      </div>
    </div>
  );
}
