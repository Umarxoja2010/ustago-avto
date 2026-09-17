import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  Moon,
  Palette,
  Server,
  ShieldCheck,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import i18n from "@/lib/i18n";
import { useLanguage, type LanguageCode } from "@/lib/language";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api-client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/settings")({
  head: () => ({
    meta: [
      {
        title: i18n.t("admin:settings.head.title", {
          defaultValue: "Sozlamalar — UstaGo Avto Admin",
        }),
      },
      {
        name: "description",
        content: i18n.t("admin:settings.head.description", {
          defaultValue: "Ilova nomi, qo'llab-quvvatlash kontaktlari va tillarni sozlash.",
        }),
      },
      {
        property: "og:title",
        content: i18n.t("admin:settings.head.title", { defaultValue: "Sozlamalar" }),
      },
      {
        property: "og:description",
        content: i18n.t("admin:settings.head.ogDescription", {
          defaultValue: "UstaGo Avto uchun umumiy konfiguratsiya.",
        }),
      },
    ],
  }),
  component: SettingsPage,
});

const languages = [
  { code: "uz", name: "UZ", fullName: "O'zbekcha", flag: "🇺🇿" },
  { code: "ru", name: "RU", fullName: "Русский", flag: "🇷🇺" },
  { code: "en", name: "ENG", fullName: "English", flag: "🇬🇧" },
] as const;

const TEXTS = {
  uz: {
    headerTitle: "Sozlamalar",
    headerDesc: "UstaGo Avto platformasining umumiy konfiguratsiyasi.",
    languagesTitle: "Tillar",
    languagesDesc: "Platforma va boshqaruv paneli tilini tanlang.",
    defaultLanguage: "Standart til",
    themeTitle: "Mavzu va Ko'rinish",
    themeDesc: "Admin panel uchun vizual ranglar sozlamalari.",
    darkMode: "Tungi rejim (Dark mode)",
    darkModeHint: "Ko'zga qulay qorong'i ranglar mavzusini yoqish yoki o'chirish.",
    securityTitle: "Xavfsizlik va Parol",
    securityDesc: "Administrator parolini yangilash va hisob xavfsizligini ta'minlash.",
    currentPassword: "Joriy parol",
    currentPasswordPlaceholder: "Hozirgi parolingizni kiriting",
    newPassword: "Yangi parol",
    newPasswordPlaceholder: "Yangi parolni kiriting (kamida 6 ta belgi)",
    confirmPassword: "Yangi parolni tasdiqlash",
    confirmPasswordPlaceholder: "Yangi parolni qayta kiriting",
    changePassword: "Parolni yangilash",
    updating: "Saqlanmoqda...",
    passwordUpdated: "Parol muvaffaqiyatli yangilandi!",
    passwordInvalid:
      "Yangi parol kamida 6 ta belgidan iborat bo'lishi va tasdiq bilan mos kelishi kerak.",
    fillAllFields: "Iltimos, barcha parol maydonlarini to'liq to'ldiring.",
    requirements: "Xavfsizlik talablari:",
    reqMin: "Parol kamida 6 ta belgidan iborat bo'lishi shart",
    reqMatch: "Yangi parol va tasdiq bir-biriga to'liq mos bo'lishi kerak",
    systemTitle: "Tizim ma'lumotlari",
    systemDesc: "Platformaning asosiy konfiguratsiya parametrlari.",
    platform: "Platforma",
    systemStatus: "Tizim holati",
    online: "Onlayn (Faol)",
    admin: "Administrator",
  },
  ru: {
    headerTitle: "Настройки",
    headerDesc: "Общая конфигурация платформы UstaGo Avto.",
    languagesTitle: "Языки",
    languagesDesc: "Выберите язык для платформы и панели администратора.",
    defaultLanguage: "Язык по умолчанию",
    themeTitle: "Тема и Оформление",
    themeDesc: "Визуальные настройки панели администратора.",
    darkMode: "Темный режим (Dark mode)",
    darkModeHint: "Включить или отключить темную тему интерфейса.",
    securityTitle: "Безопасность и Пароль",
    securityDesc: "Управление паролем и безопасностью учетной записи администратора.",
    currentPassword: "Текущий пароль",
    currentPasswordPlaceholder: "Введите текущий пароль",
    newPassword: "Новый пароль",
    newPasswordPlaceholder: "Введите новый пароль (не менее 6 символов)",
    confirmPassword: "Подтверждение пароля",
    confirmPasswordPlaceholder: "Повторите новый пароль",
    changePassword: "Сменить пароль",
    updating: "Сохранение...",
    passwordUpdated: "Пароль успешно обновлен!",
    passwordInvalid:
      "Новый пароль должен содержать не менее 6 символов и совпадать с подтверждением.",
    fillAllFields: "Пожалуйста, заполните все поля пароля.",
    requirements: "Требования безопасности:",
    reqMin: "Пароль должен содержать не менее 6 символов",
    reqMatch: "Новый пароль и подтверждение должны полностью совпадать",
    systemTitle: "Информация о системе",
    systemDesc: "Основные параметры конфигурации платформы.",
    platform: "Платформа",
    systemStatus: "Статус системы",
    online: "Онлайн (Активен)",
    admin: "Администратор",
  },
  en: {
    headerTitle: "Settings",
    headerDesc: "General configuration of the UstaGo Avto platform.",
    languagesTitle: "Languages",
    languagesDesc: "Select language for the platform and admin panel.",
    defaultLanguage: "Default language",
    themeTitle: "Theme & Appearance",
    themeDesc: "Visual settings for the admin panel.",
    darkMode: "Dark Mode",
    darkModeHint: "Toggle dark theme for comfortable viewing in low-light environments.",
    securityTitle: "Security & Password",
    securityDesc: "Manage administrator account security and password.",
    currentPassword: "Current password",
    currentPasswordPlaceholder: "Enter your current password",
    newPassword: "New password",
    newPasswordPlaceholder: "Enter new password (at least 6 characters)",
    confirmPassword: "Confirm new password",
    confirmPasswordPlaceholder: "Re-enter new password",
    changePassword: "Change password",
    updating: "Saving...",
    passwordUpdated: "Password updated successfully!",
    passwordInvalid: "New password must be at least 6 characters and match confirmation.",
    fillAllFields: "Please fill in all password fields.",
    requirements: "Security requirements:",
    reqMin: "Password must be at least 6 characters",
    reqMatch: "New password and confirmation must match exactly",
    systemTitle: "System Info",
    systemDesc: "Core configuration parameters of the platform.",
    platform: "Platform",
    systemStatus: "System status",
    online: "Online (Active)",
    admin: "Administrator",
  },
};

function Card({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-elevated rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-shadow">
      <div className="flex items-start gap-3">
        {Icon ? (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div>
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const txt = TEXTS[language as keyof typeof TEXTS] || TEXTS.uz;

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  const [dark, setDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);

  const toggleTheme = (on: boolean) => {
    setDark(on);
    document.documentElement.classList.toggle("dark", on);
    localStorage.setItem("ustago.theme", on ? "dark" : "light");
  };

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error(txt.fillAllFields);
      return;
    }
    if (newPassword.length < 6) {
      toast.error(txt.passwordInvalid);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(txt.passwordInvalid);
      return;
    }

    setSaving(true);
    try {
      await api.patch("/user", {
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast.success(txt.passwordUpdated);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : txt.passwordInvalid);
    } finally {
      setSaving(false);
    }
  };

  const isLengthValid = newPassword.length >= 6;
  const isMatchValid = Boolean(newPassword && confirmPassword && newPassword === confirmPassword);

  return (
    <>
      <PageHeader title={txt.headerTitle} description={txt.headerDesc} />

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left Column: Language, Theme & System Info */}
        <div className="space-y-5 lg:col-span-6 xl:col-span-5">
          {/* Languages Card */}
          <Card icon={Globe} title={txt.languagesTitle} description={txt.languagesDesc}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground">
                  {txt.defaultLanguage}
                </Label>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {currentLangObj.flag} {currentLangObj.name}
                </span>
              </div>
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as LanguageCode)}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-border bg-background px-3.5 text-sm font-medium">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{currentLangObj.flag}</span>
                      <span className="font-bold">{currentLangObj.name}</span>
                      <span className="text-muted-foreground font-normal">
                        ({currentLangObj.fullName})
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  {languages.map((l) => (
                    <SelectItem
                      key={l.code}
                      value={l.code}
                      className="cursor-pointer rounded-lg py-2.5 text-sm font-medium"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{l.flag}</span>
                        <span className="font-bold">{l.name}</span>
                        <span className="text-muted-foreground font-normal">({l.fullName})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Theme Card */}
          <Card icon={Palette} title={txt.themeTitle} description={txt.themeDesc}>
            <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/60 p-3.5 transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-xl transition-colors",
                    dark ? "bg-amber-500/15 text-amber-400" : "bg-primary/10 text-primary",
                  )}
                >
                  {dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{txt.darkMode}</p>
                  <p className="text-xs text-muted-foreground">{txt.darkModeHint}</p>
                </div>
              </div>
              <Switch checked={dark} onCheckedChange={toggleTheme} aria-label={txt.darkMode} />
            </div>
          </Card>

          {/* System Info Card */}
          <Card icon={Server} title={txt.systemTitle} description={txt.systemDesc}>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-2.5">
                <span className="text-muted-foreground">{txt.platform}</span>
                <span className="font-semibold text-foreground">UstaGo Avto Admin</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-2.5">
                <span className="text-muted-foreground">{txt.systemStatus}</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {txt.online}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-2.5">
                <span className="text-muted-foreground">{txt.admin}</span>
                <span className="font-medium text-foreground">
                  {user?.name || "Bosh Administrator"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Security & Password Card */}
        <div className="lg:col-span-6 xl:col-span-7">
          <Card icon={ShieldCheck} title={txt.securityTitle} description={txt.securityDesc}>
            <form className="space-y-4" onSubmit={changePassword}>
              {/* Current Password */}
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-semibold text-foreground">
                  {txt.currentPassword}
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder={txt.currentPasswordPlaceholder}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-background pr-10 pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                    aria-label={showCurrent ? "Yashirish" : "Ko'rsatish"}
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs font-semibold text-foreground">
                  {txt.newPassword}
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={txt.newPasswordPlaceholder}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-background pr-10 pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                    aria-label={showNew ? "Yashirish" : "Ko'rsatish"}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
                  {txt.confirmPassword}
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={txt.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-background pr-10 pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                    aria-label={showConfirm ? "Yashirish" : "Ko'rsatish"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="rounded-xl bg-muted/40 p-3 border border-border/50 text-xs space-y-1.5">
                <p className="font-semibold text-foreground">{txt.requirements}</p>
                <div className="space-y-1 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        isLengthValid ? "text-emerald-500 font-bold" : "text-muted-foreground/40",
                      )}
                    />
                    <span className={cn(isLengthValid && "text-foreground font-medium")}>
                      {txt.reqMin}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        isMatchValid ? "text-emerald-500 font-bold" : "text-muted-foreground/40",
                      )}
                    />
                    <span className={cn(isMatchValid && "text-foreground font-medium")}>
                      {txt.reqMatch}
                    </span>
                  </div>
                </div>
              </div>

              {/* Beautiful, Ergonomic Submit Button */}
              <button
                type="submit"
                disabled={saving || !newPassword || !confirmPassword}
                className="group relative flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-[#15803d] px-5 text-sm font-bold text-white shadow-sm shadow-emerald-700/20 transition-all hover:bg-[#166534] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>{txt.updating}</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110" />
                    <span>{txt.changePassword}</span>
                  </>
                )}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
