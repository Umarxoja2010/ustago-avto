import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  Clock,
  Navigation,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BrandLogo } from "@/components/BrandLogo";
import { roleHome, useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import i18n from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      {
        title: i18n.t("auth:intro.metaTitle", {
          defaultValue: "UstaGo Avto — O'zbekistondagi ishonchli avtoservis tarmog'i",
        }),
      },
      {
        name: "description",
        content: i18n.t("auth:intro.metaDescription", {
          defaultValue:
            "Avtomobilingiz uchun eng yaqin va tajribali ustalarni toping, shaffof narxlarda navbatsiz band qiling.",
        }),
      },
      {
        property: "og:title",
        content: i18n.t("auth:intro.metaTitle", {
          defaultValue: "UstaGo Avto — Ishonchli avtoservis tarmog'i",
        }),
      },
      {
        property: "og:description",
        content: i18n.t("auth:intro.metaDescription", {
          defaultValue:
            "Avtomobilingiz uchun eng yaqin va tajribali ustalarni toping, shaffof narxlarda navbatsiz band qiling.",
        }),
      },
    ],
  }),
  component: WelcomeIntroPage,
});

const INTRO_TEXTS = {
  uz: {
    title1: "Eng yaqin ustalarni toping",
    desc1:
      "Atrofingizdagi eng ishonchli avtoservislar xaritada bir zumda va qulay navigatsiya bilan.",
    tag1_dist: "1.2 km yaqin",
    tag1_service: "Avtoservis",
    tag1_rating: "4.9 reyting",

    title2: "Shaffof va adolatli narxlar",
    desc2:
      "Kutilmagan to'lovlarsiz, har bir xizmatning o'rtacha bozor narxini oldindan aniq biling.",
    tag2_price: "Adolatli narx",
    tag2_hidden: "Yashirin to'lovlarsiz",
    tag2_clear: "Shaffof",

    title3: "Navbatsiz va tezkor qabul",
    desc3: "O'zingizga qulay vaqtni tanlang va avtoservisda navbat kutmasdan tezkor xizmat oling.",
    tag3_queue: "Navbatsiz qabul",
    tag3_fast: "Tezkor tasdiq",
    tag3_support: "24/7 yordam",

    btn_next: "Keyingisi",
    btn_start: "Boshlash",
    btn_skip: "O'tkazib yuborish",
    link_has_account: "Hisobingiz yo'qmi?",
    link_register: "Ro'yxatdan o'tish",
  },
  ru: {
    title1: "Находите мастеров рядом",
    desc1: "Лучшие проверенные автосервисы вокруг вас на карте в один клик с удобной навигацией.",
    tag1_dist: "1.2 км рядом",
    tag1_service: "Автосервис",
    tag1_rating: "Рейтинг 4.9",

    title2: "Честные и понятные цены",
    desc2: "Узнавайте среднюю рыночную стоимость ремонта заранее без скрытых комиссий.",
    tag2_price: "Честная цена",
    tag2_hidden: "Без скрытых доплат",
    tag2_clear: "Прозрачно",

    title3: "Быстрая запись без очереди",
    desc3: "Бронируйте удобное время и обслуживайте автомобиль без лишнего ожидания.",
    tag3_queue: "Без очереди",
    tag3_fast: "Быстрое подтверждение",
    tag3_support: "24/7 помощь",

    btn_next: "Далее",
    btn_start: "Начать",
    btn_skip: "Пропустить",
    link_has_account: "Нет аккаунта?",
    link_register: "Регистрация",
  },
  en: {
    title1: "Find Nearby Mechanics",
    desc1: "Discover top-rated auto services around you instantly on the map with easy navigation.",
    tag1_dist: "1.2 km nearby",
    tag1_service: "Auto Service",
    tag1_rating: "4.9 Rating",

    title2: "Fair & Transparent Prices",
    desc2: "Know the average market prices upfront without any hidden fees or surprises.",
    tag2_price: "Fair price",
    tag2_hidden: "No hidden fees",
    tag2_clear: "Transparent",

    title3: "Fast Booking, Zero Queue",
    desc3: "Choose your preferred time slot online and save your valuable time at the workshop.",
    tag3_queue: "No queue",
    tag3_fast: "Instant confirm",
    tag3_support: "24/7 support",

    btn_next: "Next",
    btn_start: "Get Started",
    btn_skip: "Skip",
    link_has_account: "Don't have an account?",
    link_register: "Register",
  },
};

function WelcomeIntroPage() {
  const { user, ready } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const t = INTRO_TEXTS[language as keyof typeof INTRO_TEXTS] || INTRO_TEXTS.uz;

  useEffect(() => {
    if (ready && user) {
      navigate({ to: roleHome[user.role], replace: true });
    }
  }, [ready, user, navigate]);

  const slides = [
    {
      id: 0,
      title: t.title1,
      description: t.desc1,
      renderVisual: () => (
        <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
          {/* Glowing pulse rings */}
          <div className="absolute inset-0 rounded-full border border-emerald-500/15 bg-emerald-500/5 animate-ping opacity-30" />
          <div className="absolute h-44 w-44 rounded-full border border-emerald-500/20 bg-emerald-50/50" />
          <div className="absolute h-32 w-32 rounded-full border border-dashed border-emerald-500/30" />

          {/* Center glowing core */}
          <div className="relative z-10 grid h-20 w-20 place-items-center rounded-3xl bg-[#071a32] shadow-xl shadow-[#071a32]/20 ring-4 ring-emerald-500/20 transition-transform duration-300 hover:scale-105">
            <Navigation className="h-9 w-9 text-emerald-400" />
          </div>

          {/* Floating badge 1: Distance */}
          <div className="absolute -top-1 right-2 z-20 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#071a32] shadow-md border border-slate-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t.tag1_dist}</span>
          </div>

          {/* Floating badge 2: Service */}
          <div className="absolute bottom-2 -left-1 z-20 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#15803d] shadow-md border border-slate-100">
            <Wrench className="h-3.5 w-3.5 text-[#15803d]" />
            <span>{t.tag1_service}</span>
          </div>

          {/* Floating badge 3: Rating */}
          <div className="absolute bottom-3 right-2 z-20 flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{t.tag1_rating}</span>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      title: t.title2,
      description: t.desc2,
      renderVisual: () => (
        <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
          {/* Subtle soft background rings */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-xl" />
          <div className="absolute h-44 w-44 rounded-full border border-slate-200 bg-slate-50/70" />
          <div className="absolute h-32 w-32 rounded-full border border-dashed border-emerald-500/25" />

          {/* Center core */}
          <div className="relative z-10 grid h-20 w-20 place-items-center rounded-3xl bg-[#071a32] shadow-xl shadow-[#071a32]/20 ring-4 ring-emerald-500/20 transition-transform duration-300 hover:scale-105">
            <ShieldCheck className="h-9 w-9 text-emerald-400" />
          </div>

          {/* Floating badge 1: Fair Price */}
          <div className="absolute -top-1 left-1 z-20 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#071a32] shadow-md border border-slate-100">
            <BadgePercent className="h-3.5 w-3.5 text-[#15803d]" />
            <span>{t.tag2_price}</span>
          </div>

          {/* Floating badge 2: No hidden fees */}
          <div className="absolute bottom-2 -right-1 z-20 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#15803d] shadow-md border border-slate-100">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>{t.tag2_hidden}</span>
          </div>

          {/* Floating badge 3: Verified Check */}
          <div className="absolute bottom-4 left-2 z-20 flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#15803d] border border-emerald-200 shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t.tag2_clear}</span>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: t.title3,
      description: t.desc3,
      renderVisual: () => (
        <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
          {/* Soft animated background */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-xl" />
          <div className="absolute h-44 w-44 rounded-full border border-emerald-500/20 bg-emerald-50/50" />
          <div className="absolute h-32 w-32 rounded-full border border-dashed border-emerald-500/30" />

          {/* Center core */}
          <div className="relative z-10 grid h-20 w-20 place-items-center rounded-3xl bg-[#071a32] shadow-xl shadow-[#071a32]/20 ring-4 ring-emerald-500/20 transition-transform duration-300 hover:scale-105">
            <Zap className="h-9 w-9 text-amber-400" />
          </div>

          {/* Floating badge 1: No Queue */}
          <div className="absolute -top-1 right-1 z-20 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#071a32] shadow-md border border-slate-100">
            <Clock className="h-3.5 w-3.5 text-[#15803d]" />
            <span>{t.tag3_queue}</span>
          </div>

          {/* Floating badge 2: Fast Confirm */}
          <div className="absolute bottom-2 -left-1 z-20 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#15803d] shadow-md border border-slate-100">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#15803d]" />
            <span>{t.tag3_fast}</span>
          </div>

          {/* Floating badge 3: 24/7 */}
          <div className="absolute bottom-3 right-3 z-20 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-[#15803d] border border-emerald-200 shadow-sm">
            {t.tag3_support}
          </div>
        </div>
      ),
    },
  ];

  const current = slides[activeSlide];
  const isLastSlide = activeSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      navigate({ to: "/login" });
    } else {
      setActiveSlide((prev) => prev + 1);
    }
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      // Swiped left -> Next
      handleNext();
    } else if (diff < -50 && activeSlide > 0) {
      // Swiped right -> Previous
      setActiveSlide((prev) => prev - 1);
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="flex min-h-[100dvh] w-full flex-col justify-between bg-slate-50 text-slate-900 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Centered Mobile Frame */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between bg-white px-6 py-6 sm:border-x sm:border-slate-200 sm:shadow-sm">
        {/* Top Header: Logo + Language + Skip */}
        <header className="flex items-center justify-between">
          <BrandLogo size="md" theme="light" />
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-400 transition-colors hover:text-slate-700"
            >
              {t.btn_skip}
            </Link>
          </div>
        </header>

        {/* Center Showcase */}
        <main className="my-auto flex flex-col items-center py-6 text-center">
          {/* Visual Illustration */}
          <div className="relative flex min-h-[220px] items-center justify-center">
            {current.renderVisual()}
          </div>

          {/* Pagination Dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  idx === activeSlide ? "w-8 bg-[#15803d]" : "w-2 bg-slate-200 hover:bg-slate-300",
                )}
                aria-label={`Slayd ${idx + 1}`}
              />
            ))}
          </div>

          {/* Title & Description */}
          <div className="mt-6 space-y-2.5 px-2">
            <h1 className="text-2xl font-black tracking-tight text-[#071a32] sm:text-3xl leading-snug">
              {current.title}
            </h1>
            <p className="mx-auto max-w-[320px] text-sm text-slate-500 leading-relaxed">
              {current.description}
            </p>
          </div>
        </main>

        {/* Bottom Actions */}
        <div className="space-y-3 pt-2">
          {/* Primary Action Button: 'Keyingisi' on slides 0 & 1, 'Boshlash' on slide 2 */}
          <button
            type="button"
            onClick={handleNext}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#15803d] text-base font-bold text-white shadow-lg shadow-emerald-800/20 transition-all hover:bg-[#166534] active:scale-[0.98]"
          >
            <span>{isLastSlide ? t.btn_start : t.btn_next}</span>
            <ArrowRight className="h-5 w-5" />
          </button>

          {/* Subtle Register link on the last slide */}
          {isLastSlide && (
            <div className="pt-1 text-center animate-fadeIn">
              <Link
                to="/register"
                className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-800"
              >
                {t.link_has_account}{" "}
                <span className="font-bold text-[#15803d]">{t.link_register}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
