import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Route = createFileRoute("/privacy")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Maxfiylik siyosati — UstaGo Avto" },
      {
        name: "description",
        content:
          "UstaGo Avto platformasining rasmiy maxfiylik siyosati va foydalanuvchilar ma'lumotlarini himoya qilish qoidalari.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100"
              aria-label="Orqaga"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <BrandLogo size="sm" theme="light" />
          </div>
          <LanguageSwitcher compact />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-[#15803d]">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#071a32] sm:text-3xl">Maxfiylik Siyosati</h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                Oxirgi yangilanish: 15-sentabr, 2026-yil | Versiya 1.0
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600 sm:text-base">
            {/* 1. Kirish */}
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#071a32]">
                <FileText className="h-5 w-5 text-[#15803d]" />
                1. Umumiy qoidalar
              </h2>
              <p>
                Ushbu Maxfiylik siyosati <strong>"UstaGo Avto"</strong> mobil va veb-platformasi
                (keyingi o‘rinlarda "Platforma" yoki "Ilova") foydalanuvchilarining shaxsiy
                ma'lumotlarini yig'ish, ulardan foydalanish, saqlash va himoya qilish tartibini
                belgilaydi. Biz foydalanuvchilarimizning shaxsiy daxlsizligini hurmat qilamiz va
                Google Play Store xavfsizlik talablariga to‘liq rioya qilamiz.
              </p>
            </section>

            {/* 2. Yig'iladigan ma'lumotlar */}
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#071a32]">
                <Eye className="h-5 w-5 text-[#15803d]" />
                2. Yig'iladigan ma'lumotlar turlari
              </h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong>Hisob ma'lumotlari:</strong> Foydalanuvchi ismi, telefon raqami, elektron
                  pochta manzili (ixtiyoriy) va profil rasmi.
                </li>
                <li>
                  <strong>Geolokatsiya ma'lumotlari (Geomanzil):</strong> Ilova sizga eng yaqin
                  bo‘lgan ustaxonalarni xaritada ko‘rsatish va masofani hisoblash uchun faqat
                  ilovadan foydalanayotgan vaqtingizda (approximate yoki precise location) ruxsat
                  so‘raydi. Lokatsiya fon rejimida foydalanilmaydi.
                </li>
                <li>
                  <strong>Avtomobil ma'lumotlari:</strong> Avtoservis xizmatlariga navbatga yozilish
                  uchun avtomobil rusumi, modeli, yili va davlat raqami (ixtiyoriy).
                </li>
                <li>
                  <strong>Buyurtmalar va sharhlar:</strong> Avtoservis qabuliga yozilish sanalari,
                  bajarilgan xizmatlar va ustalarga qoldirilgan baholashlar.
                </li>
              </ul>
            </section>

            {/* 3. Ma'lumotlardan foydalanish */}
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#071a32]">
                <CheckCircle className="h-5 w-5 text-[#15803d]" />
                3. Ma'lumotlardan foydalanish maqsadi
              </h2>
              <p>Yig'ilgan ma'lumotlar quyidagi aniq maqsadlarda ishlatiladi:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Avtoservis ustalari bilan xavfsiz va navbatsiz bog‘lanishni ta'minlash;</li>
                <li>Xaritalar orqali eng yaqin xizmat ko‘rsatish nuqtalarini saralash;</li>
                <li>Bandlov holati bo‘yicha bildirishnomalar yuborish;</li>
                <li>Platforma sifatini yaxshilash va texnik xatoliklarni bartaraf etish.</li>
              </ul>
            </section>

            {/* 4. Ma'lumotlar xavfsizligi */}
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#071a32]">
                <Lock className="h-5 w-5 text-[#15803d]" />
                4. Xavfsizlik va ma'lumotlarni saqlash
              </h2>
              <p>
                Barcha tarmoq orqali uzatiladigan so‘rovlar zamonaviy <strong>HTTPS/TLS</strong>{" "}
                shifrlash protokollari orqali himoyalangan. Biz foydalanuvchi ma'lumotlarini
                uchinchi shaxslarga tijoriy maqsadda sotmaymiz yoki ijaraga bermaymiz.
              </p>
            </section>

            {/* 5. Hisobni va ma'lumotlarni o'chirish */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#071a32]">
                5. Foydalanuvchi huquqlari va Hisobni o'chirish
              </h2>
              <p>
                Google Play Store talablariga ko‘ra, har bir foydalanuvchi o‘z profilini va unga
                tegishli barcha shaxsiy ma'lumotlarni istalgan paytda to‘liq o‘chirib tashlash
                huquqiga ega. Buning uchun profil sozlamalari orqali yoki quyidagi elektron pochta
                orqali murojaat qilishingiz mumkin: <strong>support@ustago.uz</strong>. Murojaat
                kelib tushgach, barcha ma'lumotlar 7 ish kuni ichida o‘chiriladi.
              </p>
            </section>

            {/* 6. Bog'lanish */}
            <section className="border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-[#071a32]">6. Bog'lanish uchun</h2>
              <p className="mt-2">
                Ushbu Maxfiylik siyosati bo‘yicha savollaringiz yoki takliflaringiz bo‘lsa:
              </p>
              <div className="mt-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <p>
                  <strong>Platforma:</strong> UstaGo Avto
                </p>
                <p>
                  <strong>Elektron pochta:</strong> support@ustago.uz
                </p>
                <p>
                  <strong>Veb-sayt:</strong> https://ustago.uz
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
