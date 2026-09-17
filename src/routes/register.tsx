import { LocationInput } from "@/components/LocationInput";
import { LocationPickerDialog } from "@/components/LocationMapPicker";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  User,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BrandLogo } from "@/components/BrandLogo";
import { roleHome, useAuth } from "@/lib/auth";
import { formatUzPhone, isValidUzPhone, normalizeUzPhone } from "@/lib/phone-utils";
import { cn } from "@/lib/utils";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: i18n.t("auth:register.metaTitle") },
      {
        name: "description",
        content: i18n.t("auth:register.metaDescription"),
      },
      { property: "og:title", content: i18n.t("auth:register.metaTitle") },
      {
        property: "og:description",
        content: i18n.t("auth:register.metaDescription"),
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

type AccountType = "customer" | "mechanic";

function RegisterPage() {
  const { t } = useTranslation("auth");
  const { user, ready, register } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<AccountType>("customer");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
    region: "",
    city: "",
  });
  const [shop, setShop] = useState({
    name: "",
    address: "",
    city: "Tashkent",
    experience: "",
    services: "",
    lat: 41.311081,
    lng: 69.240562,
  });
  const [mapPickerOpen, setMapPickerOpen] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: roleHome[user.role], replace: true });
  }, [ready, user, navigate]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatUzPhone(e.target.value);
    setForm((f) => ({ ...f, phone: formatted }));
  };

  const submitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidUzPhone(form.phone)) {
      toast.error(
        t("register.invalidPhone", {
          defaultValue: "Telefon raqamini to'liq kiriting (+998 XX-XXX-XX-XX)",
        }),
      );
      return;
    }
    if (form.password.length < 6) {
      toast.error(t("register.passwordTooShort"));
      return;
    }
    if (form.password !== form.confirm) {
      toast.error(t("register.passwordsDoNotMatch"));
      return;
    }
    if (type === "mechanic") {
      // Usta tanlanganda uning shahrini tanlangan shahar bilan sinxronlash
      if (form.city) {
        setShop((s) => ({ ...s, city: form.city }));
      }
      setStep(2);
      return;
    }
    await finish();
  };

  const finish = async (workshop?: typeof shop) => {
    setLoading(true);
    try {
      const created = await register({
        role: type,
        name: form.name,
        phone: normalizeUzPhone(form.phone),
        email: form.email || undefined,
        password: form.password,
        region: form.region,
        city: form.city,
        workshop,
      });
      toast.success(t("register.accountCreated"));
      navigate({ to: roleHome[created.role], replace: true });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? t(err.message, { defaultValue: t("register.registrationFailed") })
          : t("register.registrationFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col justify-between bg-slate-50 text-slate-900">
      {/* Centered Mobile-First Frame */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between bg-white px-5 py-6 sm:border-x sm:border-slate-200 sm:px-8 sm:py-8 sm:shadow-sm">
        {/* Top Header */}
        <header className="flex items-center justify-between">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#071a32] transition-colors hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t("register.back", { defaultValue: "Orqaga" })}</span>
            </button>
          ) : (
            <BrandLogo size="md" theme="light" />
          )}
          <LanguageSwitcher compact />
        </header>

        {/* Main Content */}
        <main className="my-auto py-6">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-[#071a32] sm:text-3xl">
              {step === 1 ? t("register.titleStep1") : t("register.titleStep2")}
            </h1>
            <p className="text-sm text-slate-500">
              {step === 1 ? t("register.subtitleStep1") : t("register.subtitleStep2")}
            </p>
          </div>

          {step === 1 ? (
            <>
              {/* Account Type Selector */}
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {(
                  [
                    {
                      value: "customer",
                      label: t("register.accountTypeCustomer"),
                      icon: User,
                      hint: t("register.accountTypeCustomerHint"),
                    },
                    {
                      value: "mechanic",
                      label: t("register.accountTypeMechanic"),
                      icon: Wrench,
                      hint: t("register.accountTypeMechanicHint"),
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-all",
                      type === opt.value
                        ? "border-[#15803d] bg-[#15803d]/5 font-semibold text-[#15803d] shadow-sm ring-1 ring-[#15803d]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                    )}
                  >
                    <opt.icon
                      className={cn(
                        "mb-1.5 h-6 w-6",
                        type === opt.value ? "text-[#15803d]" : "text-slate-400",
                      )}
                    />
                    <p className="text-sm font-bold">{opt.label}</p>
                    <p className="text-[11px] opacity-75">{opt.hint}</p>
                  </button>
                ))}
              </div>

              <form onSubmit={submitAccount} className="mt-5 space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-[#071a32]">
                    {t("register.fullName")}
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Ism va familiyangiz"
                    className="h-11 rounded-xl border-slate-200 focus:border-[#15803d] focus:ring-[#15803d]/15"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-[#071a32]">
                    {t("register.phoneNumber")}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+998 90-123-45-67"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    className="h-11 rounded-xl border-slate-200 font-mono text-sm tracking-wide focus:border-[#15803d] focus:ring-[#15803d]/15"
                    maxLength={17}
                    required
                  />
                  <p className="text-[11px] text-slate-400">
                    {t("register.phoneHint", {
                      defaultValue: "Format: +998 XX-XXX-XX-XX (aniq 9 ta raqam)",
                    })}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-[#071a32]">
                    {t("register.emailOptional")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="example@mail.uz (ixtiyoriy)"
                    className="h-11 rounded-xl border-slate-200 focus:border-[#15803d] focus:ring-[#15803d]/15"
                  />
                </div>

                {/* Shahar va Viloyat tanlash qismi */}
                <div className="space-y-1.5">
                  <LocationInput
                    onSelect={(selectedRegion: string, selectedCity: string) => {
                      setForm((prev) => ({
                        ...prev,
                        region: selectedRegion,
                        city: selectedCity,
                      }));
                    }}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-semibold text-[#071a32]">
                      {t("register.passwordLabel")}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Kamida 6 ta belgi"
                      value={form.password}
                      onChange={set("password")}
                      className="h-11 rounded-xl border-slate-200 focus:border-[#15803d] focus:ring-[#15803d]/15"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm" className="text-xs font-semibold text-[#071a32]">
                      {t("register.confirmPasswordLabel")}
                    </Label>
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="Parolni qayta tering"
                      value={form.confirm}
                      onChange={set("confirm")}
                      className="h-11 rounded-xl border-slate-200 focus:border-[#15803d] focus:ring-[#15803d]/15"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#15803d] text-[15px] font-bold text-white shadow-sm transition-all hover:bg-[#166534] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Kutilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {type === "mechanic" ? t("register.continue") : t("register.createAccount")}
                      </span>
                      <ArrowRight className="ml-0.5 h-4 w-4 opacity-80" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void finish(shop);
              }}
              className="mt-5 space-y-3.5"
            >
              <div className="space-y-1.5">
                <Label htmlFor="ws-name" className="text-xs font-semibold text-[#071a32]">
                  {t("register.workshopName")}
                </Label>
                <Input
                  id="ws-name"
                  value={shop.name}
                  onChange={(e) => setShop((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Masalan: Usta Avto Servis"
                  className="h-11 rounded-xl border-slate-200 focus:border-[#15803d] focus:ring-[#15803d]/15"
                  required
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ws-city" className="text-xs font-semibold text-[#071a32]">
                    {t("register.city")}
                  </Label>
                  <Input
                    id="ws-city"
                    value={shop.city}
                    onChange={(e) => setShop((s) => ({ ...s, city: e.target.value }))}
                    className="h-11 rounded-xl border-slate-200 focus:border-[#15803d] focus:ring-[#15803d]/15"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ws-exp" className="text-xs font-semibold text-[#071a32]">
                    {t("register.yearsOfExperience")}
                  </Label>
                  <Input
                    id="ws-exp"
                    type="number"
                    min="0"
                    value={shop.experience}
                    onChange={(e) => setShop((s) => ({ ...s, experience: e.target.value }))}
                    className="h-11 rounded-xl border-slate-200 focus:border-[#15803d] focus:ring-[#15803d]/15"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ws-address" className="text-xs font-semibold text-[#071a32]">
                  {t("register.address")}
                </Label>
                <Input
                  id="ws-address"
                  value={shop.address}
                  onChange={(e) => setShop((s) => ({ ...s, address: e.target.value }))}
                  className="h-11 rounded-xl border-slate-200 focus:border-[#15803d] focus:ring-[#15803d]/15"
                  placeholder="Masalan: Chilonzor 19-mavze, 24-uy"
                  required
                />
              </div>

              {/* Ustaxona joylashuvi (Xaritada belgilash) */}
              <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#15803d]" />
                    <span className="text-xs font-semibold text-[#071a32]">
                      {t("register.workshopLocation")}
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#15803d] hover:underline"
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
                    className="h-8 gap-1.5 rounded-xl border-[#15803d]/30 text-xs text-[#15803d] hover:bg-[#15803d]/5"
                  >
                    <MapPin className="h-3.5 w-3.5 text-[#15803d]" />
                    <span>{t("register.pickOnMap")}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        toast.error(t("register.geolocationNotSupported"));
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const lat = Number(pos.coords.latitude.toFixed(6));
                          const lng = Number(pos.coords.longitude.toFixed(6));
                          setShop((s) => ({ ...s, lat, lng }));
                          toast.success(t("register.geolocationSuccess"));
                        },
                        () => {
                          toast.error(t("register.geolocationError"));
                        },
                        { enableHighAccuracy: true, timeout: 8000 },
                      );
                    }}
                    className="h-8 gap-1.5 rounded-xl border-slate-200 text-xs text-[#071a32]"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>{t("register.useCurrentLocation")}</span>
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-500">
                  <span className="max-w-[200px] truncate">
                    {shop.address ? `${shop.address}, ` : ""}
                    {shop.city}
                  </span>
                  <span className="ml-2 shrink-0 font-mono font-medium text-[#15803d]">
                    {shop.lat.toFixed(5)}, {shop.lng.toFixed(5)}
                  </span>
                </div>
              </div>

              <LocationPickerDialog
                open={mapPickerOpen}
                onOpenChange={setMapPickerOpen}
                initialCoords={{ lat: shop.lat, lng: shop.lng }}
                initialAddress={shop.address}
                onConfirm={(c, addr) => {
                  setShop((s) => ({
                    ...s,
                    lat: c.lat,
                    lng: c.lng,
                    ...(addr ? { address: addr } : {}),
                  }));
                  toast.success(t("register.locationPinnedSuccess"));
                }}
              />

              <div className="space-y-1.5">
                <Label htmlFor="ws-services" className="text-xs font-semibold text-[#071a32]">
                  {t("register.servicesOffered")}
                </Label>
                <Textarea
                  id="ws-services"
                  rows={3}
                  placeholder={t("register.servicesPlaceholder")}
                  value={shop.services}
                  onChange={(e) => setShop((s) => ({ ...s, services: e.target.value }))}
                  className="rounded-xl border-slate-200 focus:border-[#15803d] focus:ring-[#15803d]/15"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex h-12 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#071a32] transition-colors hover:bg-slate-50"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  <span>{t("register.back")}</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#15803d] text-[15px] font-bold text-white shadow-sm transition-all hover:bg-[#166534] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Yaratilmoqda...</span>
                    </>
                  ) : (
                    <span>{t("register.createMechanicAccount")}</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Sign in link */}
          <div className="mt-6 text-center text-sm text-slate-500">
            <span>{t("register.alreadyHaveAccount")}</span>{" "}
            <Link
              to="/login"
              className="font-bold text-[#15803d] underline underline-offset-4 transition-colors hover:text-[#166534]"
            >
              {t("register.signIn")}
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="pt-4 pb-2 text-center">
          <p className="text-[11px] text-slate-400">UstaGo Avto © 2026 • O'zbekiston</p>
        </footer>
      </div>
    </div>
  );
}
