export type UserStatus = "active" | "suspended" | "pending";

export interface AppUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  photo: string;
  registeredAt: string;
  status: UserStatus;
  city: string;
  bookings: number;
}

export type VerificationStatus = "verified" | "pending" | "rejected" | "suspended";

export interface Mechanic {
  id: string;
  workshop: string;
  owner: string;
  phone: string;
  address: string;
  services: string[];
  rating: number;
  jobs: number;
  status: VerificationStatus;
  photo: string;
  createdAt: string;
}

export type BookingStatus = "pending" | "active" | "completed" | "cancelled";

export interface Booking {
  id: string;
  customer: string;
  mechanic: string;
  service: string;
  date: string;
  status: BookingStatus;
  price: number;
}

export interface Review {
  id: string;
  customer: string;
  mechanic: string;
  rating: number;
  comment: string;
  date: string;
  hidden: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  audience: "all" | "mechanics" | "customers";
  sentAt: string;
  type: "announcement" | "alert" | "info";
}

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=2563EB&textColor=ffffff`;

const userNames = [
  ["Aziz Karimov", "Tashkent"],
  ["Dilnoza Yusupova", "Samarkand"],
  ["Sardor Rakhimov", "Bukhara"],
  ["Malika Tosheva", "Namangan"],
  ["Jasur Aliyev", "Andijan"],
  ["Nodira Ismoilova", "Fergana"],
  ["Bekzod Ergashev", "Nukus"],
  ["Zilola Nazarova", "Tashkent"],
  ["Rustam Qodirov", "Navoi"],
  ["Kamola Saidova", "Qarshi"],
  ["Otabek Yuldashev", "Jizzakh"],
  ["Shahnoza Umarova", "Termez"],
  ["Farrukh Tursunov", "Tashkent"],
  ["Gulnora Xolmatova", "Samarkand"],
  ["Islom Mirzayev", "Urgench"],
  ["Sevara Abdullayeva", "Tashkent"],
  ["Timur Sobirov", "Angren"],
  ["Lola Ganieva", "Chirchiq"],
];

export const users: AppUser[] = userNames.map(([name, city], i) => ({
  id: `USR-${1000 + i}`,
  name,
  city,
  phone: `+998 9${i % 9} ${100 + i} ${20 + i} ${10 + (i % 80)}`,
  email: `${name.split(" ")[0].toLowerCase()}${i}@ustago.uz`,
  photo: avatar(name),
  registeredAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
  status: i % 7 === 0 ? "suspended" : i % 5 === 0 ? "pending" : "active",
  bookings: (i * 3) % 24,
}));

const workshops = [
  ["Avto Master Servis", "Shuhrat Nazarov", "Chilanzar 12, Tashkent"],
  ["Turbo Garage", "Aziz Yusupov", "Yunusabad 4, Tashkent"],
  ["ProFix Motors", "Davron Qosimov", "Registon ko'chasi 8, Samarkand"],
  ["Elite Auto Care", "Bahodir Salimov", "Bunyodkor 45, Tashkent"],
  ["Speed Line Service", "Ulugbek Rasulov", "Alisher Navoi 21, Bukhara"],
  ["Motor Klinika", "Anvar Xudoyberdiyev", "Mustaqillik 3, Namangan"],
  ["Diesel Pro", "Sanjar Tolipov", "Amir Temur 77, Andijan"],
  ["City Auto Hub", "Jamshid Karimov", "Sebzor 19, Tashkent"],
  ["Nur Avto Servis", "Rustam Ibragimov", "Farg'ona yo'li 5, Fergana"],
  ["Grand Garage", "Alisher Boboev", "Do'stlik 30, Nukus"],
  ["Auto Style Center", "Kamron Xolmatov", "Yangiobod 14, Qarshi"],
  ["Mega Motors", "Elyor Sultonov", "Bog'ishamol 9, Tashkent"],
];

const serviceCatalog = [
  "Engine repair",
  "Oil change",
  "Tire service",
  "Diagnostics",
  "Body work",
  "Electrical",
  "AC service",
  "Brake service",
];

export const mechanics: Mechanic[] = workshops.map(([workshop, owner, address], i) => ({
  id: `MCH-${200 + i}`,
  workshop,
  owner,
  address,
  phone: `+998 9${(i + 3) % 9} ${300 + i} ${40 + i} ${11 + i}`,
  services: [serviceCatalog[i % 8], serviceCatalog[(i + 3) % 8], serviceCatalog[(i + 5) % 8]],
  rating: Number((3.8 + ((i * 7) % 12) / 10).toFixed(1)),
  jobs: 20 + i * 13,
  status:
    i % 6 === 0 ? "pending" : i % 9 === 0 ? "rejected" : i % 8 === 7 ? "suspended" : "verified",
  photo: avatar(workshop),
  createdAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 25) + 2).padStart(2, "0")}`,
}));

const bookingStatuses: BookingStatus[] = ["pending", "active", "completed", "cancelled"];

export const bookings: Booking[] = Array.from({ length: 26 }, (_, i) => ({
  id: `BKG-${5000 + i}`,
  customer: users[i % users.length].name,
  mechanic: mechanics[i % mechanics.length].workshop,
  service: serviceCatalog[i % serviceCatalog.length],
  date: `2026-0${(i % 7) + 1}-${String((i % 27) + 1).padStart(2, "0")}`,
  status: bookingStatuses[i % 4 === 3 && i % 5 === 0 ? 3 : i % 4],
  price: 120000 + ((i * 37) % 15) * 45000,
}));

const comments = [
  "Great service, fixed my engine in two hours.",
  "Friendly staff and fair pricing.",
  "Waited too long, but the work was solid.",
  "Very professional workshop, will come back.",
  "Price was higher than the estimate.",
  "Excellent diagnostics, found the issue fast.",
  "Clean garage, modern equipment.",
  "Not satisfied with the brake job.",
];

export const reviews: Review[] = Array.from({ length: 16 }, (_, i) => ({
  id: `REV-${900 + i}`,
  customer: users[(i + 2) % users.length].name,
  mechanic: mechanics[(i + 1) % mechanics.length].workshop,
  rating: (i % 5) + 1,
  comment: comments[i % comments.length],
  date: `2026-0${(i % 7) + 1}-${String((i % 26) + 2).padStart(2, "0")}`,
  hidden: i % 9 === 0,
}));

export const notifications: NotificationItem[] = [
  {
    id: "NTF-1",
    title: "Platform maintenance",
    message: "UstaGo Avto will be under maintenance on Sunday 02:00–04:00.",
    audience: "all",
    sentAt: "2026-07-20 09:14",
    type: "announcement",
  },
  {
    id: "NTF-2",
    title: "New verification rules",
    message: "All workshops must re-upload their license documents this month.",
    audience: "mechanics",
    sentAt: "2026-07-18 15:02",
    type: "alert",
  },
  {
    id: "NTF-3",
    title: "Summer discount campaign",
    message: "Get 15% off on oil change services until August 31.",
    audience: "customers",
    sentAt: "2026-07-12 11:40",
    type: "info",
  },
  {
    id: "NTF-4",
    title: "App update 2.4 released",
    message: "Faster booking flow and improved mechanic search.",
    audience: "all",
    sentAt: "2026-07-04 08:00",
    type: "announcement",
  },
];

export const monthlySignups = [
  { month: "Jan", users: 180, mechanics: 12 },
  { month: "Feb", users: 240, mechanics: 18 },
  { month: "Mar", users: 310, mechanics: 22 },
  { month: "Apr", users: 280, mechanics: 16 },
  { month: "May", users: 420, mechanics: 29 },
  { month: "Jun", users: 510, mechanics: 34 },
  { month: "Jul", users: 640, mechanics: 41 },
];

export const monthlyBookings = [
  { month: "Jan", bookings: 320, completed: 280 },
  { month: "Feb", bookings: 410, completed: 360 },
  { month: "Mar", bookings: 480, completed: 430 },
  { month: "Apr", bookings: 520, completed: 470 },
  { month: "May", bookings: 610, completed: 545 },
  { month: "Jun", bookings: 720, completed: 660 },
  { month: "Jul", bookings: 840, completed: 770 },
];

export const revenueData = [
  { month: "Jan", revenue: 42_000_000 },
  { month: "Feb", revenue: 51_500_000 },
  { month: "Mar", revenue: 60_200_000 },
  { month: "Apr", revenue: 58_900_000 },
  { month: "May", revenue: 73_400_000 },
  { month: "Jun", revenue: 88_100_000 },
  { month: "Jul", revenue: 96_700_000 },
];

export const popularServices = [
  { service: "Oil change", count: 1240 },
  { service: "Diagnostics", count: 980 },
  { service: "Tire service", count: 870 },
  { service: "Brake service", count: 640 },
  { service: "Engine repair", count: 520 },
  { service: "AC service", count: 410 },
];

export const formatSom = (value: number) =>
  `${value.toLocaleString("en-US").replace(/,/g, " ")} so'm`;
