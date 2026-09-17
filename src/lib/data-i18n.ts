import { useCallback } from "react";
import { useTranslation } from "react-i18next";

/**
 * Mock/demo data ships in English. This module translates data-driven strings
 * (service names, statuses, durations, demo notification copy, …) at render
 * time so no untranslated text can reach the screen. When the real API is
 * connected the backend can return localized values and this map can shrink.
 */
type Phrase = { uz: string; ru: string };

const DICTIONARY: Record<string, Phrase> = {
  // ---- Services -----------------------------------------------------------
  "Engine Repair": { uz: "Dvigatel ta'miri", ru: "Ремонт двигателя" },
  "Engine repair": { uz: "Dvigatel ta'miri", ru: "Ремонт двигателя" },
  "Engine diagnostics": { uz: "Dvigatel diagnostikasi", ru: "Диагностика двигателя" },
  "Oil Change": { uz: "Moy almashtirish", ru: "Замена масла" },
  "Oil change": { uz: "Moy almashtirish", ru: "Замена масла" },
  "Oil & filter change": { uz: "Moy va filtr almashtirish", ru: "Замена масла и фильтра" },
  Battery: { uz: "Akkumulyator", ru: "Аккумулятор" },
  "Battery replacement": { uz: "Akkumulyator almashtirish", ru: "Замена аккумулятора" },
  Electrical: { uz: "Elektr ishlari", ru: "Электрика" },
  Diagnostics: { uz: "Diagnostika", ru: "Диагностика" },
  "Full diagnostics": { uz: "To'liq diagnostika", ru: "Полная диагностика" },
  "Full inspection": { uz: "To'liq tekshiruv", ru: "Полный осмотр" },
  "Tire Service": { uz: "Shina xizmati", ru: "Шиномонтаж" },
  "Tire service": { uz: "Shina xizmati", ru: "Шиномонтаж" },
  "Tire change": { uz: "Shina almashtirish", ru: "Замена шин" },
  "Car Wash": { uz: "Avtomobil yuvish", ru: "Автомойка" },
  "Air Conditioner": { uz: "Konditsioner", ru: "Кондиционер" },
  "AC service": { uz: "Konditsioner xizmati", ru: "Обслуживание кондиционера" },
  "AC refill": { uz: "Konditsioner to'ldirish", ru: "Заправка кондиционера" },
  "Brake Service": { uz: "Tormoz xizmati", ru: "Тормозная система" },
  "Brake service": { uz: "Tormoz xizmati", ru: "Тормозная система" },
  "Brake pads replacement": {
    uz: "Tormoz kolodkalarini almashtirish",
    ru: "Замена тормозных колодок",
  },
  "Suspension repair": { uz: "Xodovoy ta'miri", ru: "Ремонт подвески" },
  "Body work": { uz: "Kuzov ishlari", ru: "Кузовные работы" },
  "Emergency Help": { uz: "Shoshilinch yordam", ru: "Экстренная помощь" },
  "Other services": { uz: "Boshqa xizmatlar", ru: "Другие услуги" },
  "Other service": { uz: "Boshqa xizmat", ru: "Другая услуга" },
  Other: { uz: "Boshqa", ru: "Другое" },

  // ---- Vehicle types / colors --------------------------------------------
  Sedan: { uz: "Sedan", ru: "Седан" },
  SUV: { uz: "Krossover", ru: "Внедорожник" },
  Hatchback: { uz: "Xetchbek", ru: "Хэтчбек" },
  Minivan: { uz: "Miniven", ru: "Минивэн" },
  Truck: { uz: "Yuk mashinasi", ru: "Грузовик" },
  "Passenger cars": { uz: "Yengil mashinalar", ru: "Легковые автомобили" },
  "Trucks & commercial": { uz: "Yuk mashinalari", ru: "Грузовые автомобили" },
  "Foreign cars": { uz: "Chet el mashinalari", ru: "Иномарки" },
  Black: { uz: "Qora", ru: "Чёрный" },
  White: { uz: "Oq", ru: "Белый" },

  // ---- Days & hours -------------------------------------------------------
  Monday: { uz: "Dushanba", ru: "Понедельник" },
  Tuesday: { uz: "Seshanba", ru: "Вторник" },
  Wednesday: { uz: "Chorshanba", ru: "Среда" },
  Thursday: { uz: "Payshanba", ru: "Четверг" },
  Friday: { uz: "Juma", ru: "Пятница" },
  Saturday: { uz: "Shanba", ru: "Суббота" },
  Sunday: { uz: "Yakshanba", ru: "Воскресенье" },
  Mon: { uz: "Du", ru: "Пн" },
  Tue: { uz: "Se", ru: "Вт" },
  Wed: { uz: "Ch", ru: "Ср" },
  Thu: { uz: "Pa", ru: "Чт" },
  Fri: { uz: "Ju", ru: "Пт" },
  Sat: { uz: "Sh", ru: "Сб" },
  Sun: { uz: "Ya", ru: "Вс" },
  "Mon – Fri": { uz: "Du – Ju", ru: "Пн – Пт" },
  Closed: { uz: "Yopiq", ru: "Закрыто" },
  Jan: { uz: "Yan", ru: "Янв" },
  Feb: { uz: "Fev", ru: "Фев" },
  Mar: { uz: "Mar", ru: "Мар" },
  Apr: { uz: "Apr", ru: "Апр" },
  May: { uz: "May", ru: "Май" },
  Jun: { uz: "Iyn", ru: "Июн" },
  Jul: { uz: "Iyl", ru: "Июл" },
  Aug: { uz: "Avg", ru: "Авг" },
  Sep: { uz: "Sen", ru: "Сен" },
  Oct: { uz: "Okt", ru: "Окт" },
  Nov: { uz: "Noy", ru: "Ноя" },
  Dec: { uz: "Dek", ru: "Дек" },

  // ---- Durations & relative time -----------------------------------------
  "30 min": { uz: "30 daq", ru: "30 мин" },
  "45 min": { uz: "45 daq", ru: "45 мин" },
  "1 h": { uz: "1 soat", ru: "1 ч" },
  "1.5 h": { uz: "1,5 soat", ru: "1,5 ч" },
  "1 h 30 min": { uz: "1 soat 30 daq", ru: "1 ч 30 мин" },
  "3 h": { uz: "3 soat", ru: "3 ч" },
  "Just now": { uz: "Hozirgina", ru: "Только что" },
  Pending: { uz: "Kutilmoqda", ru: "Ожидание" },
  Yesterday: { uz: "Kecha", ru: "Вчера" },
  "10 min ago": { uz: "10 daqiqa oldin", ru: "10 минут назад" },
  "12 min ago": { uz: "12 daqiqa oldin", ru: "12 минут назад" },
  "2 h ago": { uz: "2 soat oldin", ru: "2 часа назад" },
  "3 days ago": { uz: "3 kun oldin", ru: "3 дня назад" },
  "2 days ago": { uz: "2 kun oldin", ru: "2 дня назад" },
  "4 days ago": { uz: "4 kun oldin", ru: "4 дня назад" },

  Tomorrow: { uz: "Ertaga", ru: "Завтра" },
  "Next available day": { uz: "Keyingi bo'sh kun", ru: "Ближайший свободный день" },
  // ---- Booking timeline ---------------------------------------------------
  "Booking requested": { uz: "Buyurtma yuborildi", ru: "Заявка отправлена" },
  "Confirmed by workshop": { uz: "Servis tasdiqladi", ru: "Подтверждено сервисом" },
  "Vehicle in service": { uz: "Avtomobil xizmatda", ru: "Автомобиль в сервисе" },
  Completed: { uz: "Yakunlandi", ru: "Завершено" },
  "Cancelled by you": { uz: "Siz bekor qildingiz", ru: "Отменено вами" },

  // ---- Offers -------------------------------------------------------------
  "20% off first booking": {
    uz: "Birinchi buyurtmaga 20% chegirma",
    ru: "Скидка 20% на первый заказ",
  },
  "New to UstaGo? Your first service is on us.": {
    uz: "UstaGo'da yangimisiz? Birinchi xizmat biz tomondan.",
    ru: "Впервые в UstaGo? Первая услуга за наш счёт.",
  },
  "Claim offer": { uz: "Chegirmani olish", ru: "Получить скидку" },
  "Free diagnostics week": {
    uz: "Bepul diagnostika haftaligi",
    ru: "Неделя бесплатной диагностики",
  },
  "Full 45-point check at partner workshops.": {
    uz: "Hamkor servislarda 45 nuqtali to'liq tekshiruv.",
    ru: "Полная проверка по 45 пунктам в сервисах-партнёрах.",
  },
  "Find a workshop": { uz: "Servis topish", ru: "Найти сервис" },
  "Winter tire package": { uz: "Qishki shina to'plami", ru: "Зимний шинный пакет" },
  "Change + balance + storage from 240 000 so'm.": {
    uz: "Almashtirish + balanslash + saqlash 240 000 so'mdan.",
    ru: "Замена + балансировка + хранение от 240 000 сум.",
  },
  "See deals": { uz: "Takliflarni ko'rish", ru: "Смотреть предложения" },

  // ---- Customer notifications --------------------------------------------
  "Booking confirmed": { uz: "Buyurtma tasdiqlandi", ru: "Заказ подтверждён" },
  "Avto Master Servis confirmed your diagnostics for Tue, 10:30.": {
    uz: "Avto Master Servis seshanba 10:30 dagi diagnostikangizni tasdiqladi.",
    ru: "Avto Master Servis подтвердил диагностику во вторник в 10:30.",
  },
  "Message from ProFix Motors": { uz: "ProFix Motors'dan xabar", ru: "Сообщение от ProFix Motors" },
  "Please bring the service book with you, thanks!": {
    uz: "Iltimos, servis kitobchasini olib keling, rahmat!",
    ru: "Пожалуйста, возьмите с собой сервисную книжку, спасибо!",
  },
  "20% off your next oil change": {
    uz: "Keyingi moy almashtirishga 20% chegirma",
    ru: "Скидка 20% на следующую замену масла",
  },
  "Valid at 24 partner workshops until 31 August.": {
    uz: "31 avgustgacha 24 ta hamkor servisda amal qiladi.",
    ru: "Действует в 24 сервисах-партнёрах до 31 августа.",
  },
  "UstaGo 2.4 is here": { uz: "UstaGo 2.4 chiqdi", ru: "Вышло обновление UstaGo 2.4" },
  "Faster booking flow and live mechanic tracking on the map.": {
    uz: "Tezroq buyurtma jarayoni va xaritada usta harakatini kuzatish.",
    ru: "Быстрое оформление заказа и отслеживание мастера на карте.",
  },

  // ---- Mechanic notifications & messages ---------------------------------
  "New booking request": { uz: "Yangi buyurtma so'rovi", ru: "Новая заявка на запись" },
  "Aziz Karimov requested Engine diagnostics for tomorrow 09:30.": {
    uz: "Aziz Karimov ertaga 09:30 ga dvigatel diagnostikasini so'radi.",
    ru: "Азиз Каримов запросил диагностику двигателя на завтра 09:30.",
  },
  "New 5-star review": { uz: "Yangi 5 yulduzli sharh", ru: "Новый отзыв на 5 звёзд" },
  "Malika Tosheva rated your Oil change service 5 stars.": {
    uz: "Malika Tosheva moy almashtirish xizmatingizga 5 yulduz qo'ydi.",
    ru: "Малика Ташева оценила замену масла на 5 звёзд.",
  },
  "Verification renewed": { uz: "Tasdiqlash yangilandi", ru: "Верификация продлена" },
  "Your workshop licence was verified for another 12 months.": {
    uz: "Servisingiz litsenziyasi yana 12 oyga tasdiqlandi.",
    ru: "Лицензия вашего сервиса подтверждена ещё на 12 месяцев.",
  },
  "Can I bring the car 30 minutes earlier tomorrow?": {
    uz: "Ertaga mashinani 30 daqiqa oldin olib kelsam bo'ladimi?",
    ru: "Можно завтра пригнать машину на 30 минут раньше?",
  },
  "Thanks! The engine sounds much better now.": {
    uz: "Rahmat! Dvigatel ancha yaxshi ishlayapti.",
    ru: "Спасибо! Двигатель теперь звучит намного лучше.",
  },
  "How much for a full inspection on a Camry?": {
    uz: "Camry uchun to'liq tekshiruv qancha turadi?",
    ru: "Сколько стоит полный осмотр Camry?",
  },
  "Strange noise when braking at low speed.": {
    uz: "Past tezlikda tormozlaganda g'alati ovoz chiqadi.",
    ru: "Странный шум при торможении на низкой скорости.",
  },
  "Full-service workshop with 8 years of experience in engine repair, diagnostics and quick maintenance for European and Asian cars.":
    {
      uz: "Yevropa va Osiyo avtomobillari uchun dvigatel ta'miri, diagnostika va tezkor xizmat ko'rsatishda 8 yillik tajribaga ega to'liq servis.",
      ru: "Сервис полного цикла с 8-летним опытом ремонта двигателей, диагностики и быстрого обслуживания европейских и азиатских автомобилей.",
    },

  // ---- Reviews ------------------------------------------------------------
  "Fast, transparent pricing and the car feels brand new.": {
    uz: "Tez, narxlar shaffof va mashina yangidek bo'ldi.",
    ru: "Быстро, цены прозрачные, машина как новая.",
  },
  "Booked in the app, arrived and was served in 5 minutes.": {
    uz: "Ilovada band qildim, kelib 5 daqiqada xizmat oldim.",
    ru: "Записался в приложении, приехал и обслужили за 5 минут.",
  },
  "Professional team, clean workshop, will definitely return.": {
    uz: "Professional jamoa, toza servis, albatta yana kelaman.",
    ru: "Профессиональная команда, чистый сервис, обязательно вернусь.",
  },
  "Found the problem in 20 minutes and explained everything clearly. Great workshop.": {
    uz: "Muammoni 20 daqiqada topib, hammasini tushuntirib berishdi. Zo'r servis.",
    ru: "Нашли проблему за 20 минут и всё понятно объяснили. Отличный сервис.",
  },
  "Fast, clean and fair pricing. Will definitely come back.": {
    uz: "Tez, toza va halol narx. Albatta yana kelaman.",
    ru: "Быстро, чисто и честная цена. Обязательно вернусь.",
  },
  "Good job on the brakes, waited a bit longer than promised.": {
    uz: "Tormozlarni yaxshi qilishdi, lekin va'da qilingandan ko'proq kutdim.",
    ru: "Тормоза сделали хорошо, но ждал дольше обещанного.",
  },
  "Air conditioner works like new. Very professional team.": {
    uz: "Konditsioner yangidek ishlayapti. Juda professional jamoa.",
    ru: "Кондиционер работает как новый. Очень профессиональная команда.",
  },
  "Great service, fixed my engine in two hours.": {
    uz: "Ajoyib xizmat, dvigatelni ikki soatda tuzatishdi.",
    ru: "Отличный сервис, двигатель починили за два часа.",
  },
  "Friendly staff and fair pricing.": {
    uz: "Xodimlar xushmuomala, narxlar halol.",
    ru: "Приветливый персонал и честные цены.",
  },
  "Waited too long, but the work was solid.": {
    uz: "Uzoq kutdim, lekin ish sifatli bajarildi.",
    ru: "Долго ждал, но работа сделана качественно.",
  },
  "Very professional workshop, will come back.": {
    uz: "Juda professional servis, yana kelaman.",
    ru: "Очень профессиональный сервис, вернусь снова.",
  },
  "Price was higher than the estimate.": {
    uz: "Narx dastlabki hisob-kitobdan yuqori chiqdi.",
    ru: "Цена оказалась выше предварительной оценки.",
  },
  "Excellent diagnostics, found the issue fast.": {
    uz: "Diagnostika a'lo darajada, muammoni tez topishdi.",
    ru: "Отличная диагностика, быстро нашли проблему.",
  },
  "Clean garage, modern equipment.": {
    uz: "Toza servis, zamonaviy uskunalar.",
    ru: "Чистый сервис, современное оборудование.",
  },
  "Not satisfied with the brake job.": {
    uz: "Tormoz ishidan qoniqmadim.",
    ru: "Не доволен работой по тормозам.",
  },

  "Transmission service": { uz: "Transmissiya xizmati", ru: "Обслуживание трансмиссии" },
  "Tire fitting": { uz: "Shina montaji", ru: "Шиномонтаж" },
  "Brake repair": { uz: "Tormoz ta'miri", ru: "Ремонт тормозов" },

  // ---- Admin notifications ------------------------------------------------
  "Platform maintenance": { uz: "Platforma texnik ishlari", ru: "Технические работы" },
  "UstaGo Avto will be under maintenance on Sunday 02:00–04:00.": {
    uz: "UstaGo Avto yakshanba kuni 02:00–04:00 da texnik ishlar tufayli ishlamaydi.",
    ru: "UstaGo Avto будет недоступен в воскресенье с 02:00 до 04:00.",
  },
  "New verification rules": { uz: "Yangi tasdiqlash qoidalari", ru: "Новые правила верификации" },
  "All workshops must re-upload their license documents this month.": {
    uz: "Barcha servislar shu oyda litsenziya hujjatlarini qayta yuklashi shart.",
    ru: "Все сервисы должны повторно загрузить лицензии в этом месяце.",
  },
  "Summer discount campaign": { uz: "Yozgi chegirma aksiyasi", ru: "Летняя акция скидок" },
  "Get 15% off on oil change services until August 31.": {
    uz: "31 avgustgacha moy almashtirishga 15% chegirma.",
    ru: "Скидка 15% на замену масла до 31 августа.",
  },
  "App update 2.4 released": { uz: "2.4 ilova yangilanishi chiqdi", ru: "Вышло обновление 2.4" },
  "Faster booking flow and improved mechanic search.": {
    uz: "Tezroq buyurtma jarayoni va yaxshilangan usta qidiruvi.",
    ru: "Быстрое оформление заказа и улучшенный поиск мастеров.",
  },
};

export function translateData(text: unknown, language: string): string {
  if (text === null || text === undefined) return "";

  // Agar matn allaqachon obyekt bo'lsa (masalan: { uz: "...", ru: "..." })
  if (typeof text === "object") {
    const obj = text as Record<string, unknown>;
    const langKey = language === "ru" ? "ru" : language === "en" ? "en" : "uz";
    const val = obj[langKey] ?? obj.uz ?? obj.en ?? obj.ru;
    return typeof val === "string" ? val : "";
  }

  const str = String(text).trim();
  if (!str) return "";

  // Agar JSON string bo'lsa (masalan: '{"uz":"Dvigatel ta\'miri", ...}')
  if ((str.startsWith("{") && str.endsWith("}")) || (str.startsWith("[") && str.endsWith("]"))) {
    try {
      const parsed = JSON.parse(str);
      if (parsed && typeof parsed === "object") {
        const langKey = language === "ru" ? "ru" : language === "en" ? "en" : "uz";
        const val = parsed[langKey] ?? parsed.uz ?? parsed.en ?? parsed.ru;
        if (typeof val === "string" && val.length > 0) return val;
      }
    } catch {
      // Agar parse xatolik bersa, oddiy lug'atga o'tamiz
    }
  }

  if (language === "en") return str;

  const entry = DICTIONARY[str];
  if (entry) return language === "ru" ? entry.ru : entry.uz;

  // Katta-kichik harf farqiga sezgir bo'lmagan qidiruv
  const lower = str.toLowerCase();
  const lowerKey = Object.keys(DICTIONARY).find((k) => k.toLowerCase() === lower);
  if (lowerKey) {
    const matched = DICTIONARY[lowerKey];
    return language === "ru" ? matched.ru : matched.uz;
  }

  return str;
}

/** Returns `td(text)` — translates demo-data strings into the active language. */
export function useDataText() {
  const { i18n } = useTranslation();
  const language = i18n.language;
  return useCallback((text: unknown) => translateData(text, language), [language]);
}
