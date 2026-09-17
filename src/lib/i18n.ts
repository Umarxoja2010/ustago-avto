import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enAdmin from "@/locales/en/admin.json";
import enAuth from "@/locales/en/auth.json";
import enCommon from "@/locales/en/common.json";
import enCustomer from "@/locales/en/customer.json";
import enMechanic from "@/locales/en/mechanic.json";
import ruAdmin from "@/locales/ru/admin.json";
import ruAuth from "@/locales/ru/auth.json";
import ruCommon from "@/locales/ru/common.json";
import ruCustomer from "@/locales/ru/customer.json";
import ruMechanic from "@/locales/ru/mechanic.json";
import uzAdmin from "@/locales/uz/admin.json";
import uzAuth from "@/locales/uz/auth.json";
import uzCommon from "@/locales/uz/common.json";
import uzCustomer from "@/locales/uz/customer.json";
import uzMechanic from "@/locales/uz/mechanic.json";

export const DEFAULT_LANGUAGE = "uz" as const;
export const LANGUAGE_STORAGE_KEY = "ustago.language";

/**
 * Supported languages. `dir` is declared up-front so that adding an RTL
 * language later only requires a new entry here — no component changes.
 */
export const SUPPORTED_LANGUAGES = [
  { code: "uz", labelKey: "language.uz", flag: "🇺🇿", dir: "ltr" },
  { code: "ru", labelKey: "language.ru", flag: "🇷🇺", dir: "ltr" },
  { code: "en", labelKey: "language.en", flag: "🇺🇸", dir: "ltr" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const isLanguageCode = (value: unknown): value is LanguageCode =>
  typeof value === "string" && SUPPORTED_LANGUAGES.some((l) => l.code === value);

export const getLanguageDir = (code: string): "ltr" | "rtl" =>
  SUPPORTED_LANGUAGES.find((l) => l.code === code)?.dir ?? "ltr";

export const defaultNS = "common";

export const resources = {
  uz: {
    common: uzCommon,
    auth: uzAuth,
    customer: uzCustomer,
    mechanic: uzMechanic,
    admin: uzAdmin,
  },
  ru: {
    common: ruCommon,
    auth: ruAuth,
    customer: ruCustomer,
    mechanic: ruMechanic,
    admin: ruAdmin,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    customer: enCustomer,
    mechanic: enMechanic,
    admin: enAdmin,
  },
} as const;

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    // Always boot in the default language so SSR and the first client render
    // agree. The stored language is applied after hydration by I18nProvider.
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS,
    ns: ["common", "auth", "customer", "mechanic", "admin"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;
