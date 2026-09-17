import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BrandLogo } from "@/components/BrandLogo";
import { roleHome, useAuth } from "@/lib/auth";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: i18n.t("auth:login.metaTitle", { defaultValue: "Kirish — UstaGo Avto" }) },
      {
        name: "description",
        content: i18n.t("auth:login.metaDescription", {
          defaultValue: "UstaGo Avto platformasiga kirish",
        }),
      },
      {
        property: "og:title",
        content: i18n.t("auth:login.metaTitle", { defaultValue: "Kirish — UstaGo Avto" }),
      },
      {
        property: "og:description",
        content: i18n.t("auth:login.metaDescription", {
          defaultValue: "UstaGo Avto platformasiga kirish",
        }),
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useTranslation("auth");
  const { user, ready, signIn } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: roleHome[user.role], replace: true });
  }, [ready, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error("Telefon raqami yoki email kiriting");
      return;
    }
    if (!password) {
      toast.error("Parolni kiriting");
      return;
    }

    setLoading(true);
    try {
      const signedIn = await signIn(identifier, password);
      toast.success(
        t("login.welcomeBack", {
          name: signedIn.name,
          defaultValue: `Xush kelibsiz, ${signedIn.name}`,
        }),
      );
      navigate({ to: roleHome[signedIn.role], replace: true });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? t(err.message, {
              defaultValue: t("login.signInFailed", { defaultValue: "Kirishda xatolik yuz berdi" }),
            })
          : t("login.signInFailed", { defaultValue: "Kirishda xatolik yuz berdi" }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col justify-between bg-slate-50 text-slate-900">
      {/* Centered Mobile-First Frame */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between bg-white px-5 py-6 sm:border-x sm:border-slate-200 sm:px-8 sm:py-8 sm:shadow-sm">
        {/* Top Header with Back to Intro & Language */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Ilova haqida ma'lumot"
              title="Ilova haqida"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </Link>
            <BrandLogo size="md" theme="light" />
          </div>
          <LanguageSwitcher compact />
        </header>

        {/* Main Content */}
        <main className="my-auto py-6">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-[#071a32] sm:text-3xl">
              {t("login.title", { defaultValue: "Tizimga kirish" })}
            </h1>
            <p className="text-sm text-slate-500">Avtoservis platformasiga xush kelibsiz</p>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {/* Identifier (Phone or Email) */}
            <div className="space-y-1.5">
              <label htmlFor="identifier" className="block text-xs font-semibold text-[#071a32]">
                {t("login.identifierLabel", {
                  defaultValue: "Telefon yoki email",
                })}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#15803d]">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="+998 90 123-45-67 yoki email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-4 pl-10.5 text-[15px] text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#15803d] focus:outline-none focus:ring-2 focus:ring-[#15803d]/15"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-[#071a32]">
                  {t("login.passwordLabel", { defaultValue: "Parol" })}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#15803d] transition-colors hover:text-[#166534] hover:underline"
                >
                  {t("login.forgotPassword", {
                    defaultValue: "Parolni unutdingizmi?",
                  })}
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#15803d]">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-11 pl-10.5 text-[15px] text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#15803d] focus:outline-none focus:ring-2 focus:ring-[#15803d]/15"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button (To'q yashil) */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#15803d] text-[15px] font-bold text-white shadow-sm transition-all hover:bg-[#166534] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Kirilmoqda...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>{t("login.submit", { defaultValue: "Kirish" })}</span>
                  <ArrowRight className="ml-0.5 h-4 w-4 opacity-80" />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center text-sm text-slate-500">
            <span>{t("login.noAccount", { defaultValue: "Hisobingiz yo'qmi?" })}</span>{" "}
            <Link
              to="/register"
              className="font-bold text-[#15803d] underline underline-offset-4 transition-colors hover:text-[#166534]"
            >
              {t("login.createOne", {
                defaultValue: "Ro'yxatdan o'tish",
              })}
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="pt-4 pb-2 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-[#15803d]" />
            <span>Xavfsiz va shaffof avtoservis tarmog'i</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">UstaGo Avto © 2026 • O'zbekiston</p>
        </footer>
      </div>
    </div>
  );
}
