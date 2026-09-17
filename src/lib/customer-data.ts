export interface QuickService {
  id: string;
  name: string;
  icon: string;
  from: number;
  color: string;
}

export interface MechanicReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
}

export interface PriceItem {
  label: string;
  price: number;
  duration: string;
}

export interface MechanicProfile {
  id: string;
  name: string;
  owner: string;
  cover: string;
  logo: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  open: boolean;
  startingPrice: number;
  verified: boolean;
  experienceYears: number;
  address: string;
  district: string;
  phone: string;
  hours: { day: string; time: string }[];
  services: string[];
  vehicleTypes: string[];
  priceList: PriceItem[];
  gallery: string[];
  reviews: MechanicReview[];
  lat: number;
  lng: number;
}

export type BookingState = "upcoming" | "completed" | "cancelled";

export interface CustomerBooking {
  id: string;
  mechanicId: string;
  mechanic: string;
  service: string;
  date: string;
  time: string;
  price: number;
  state: BookingState;
  vehicle: string;
  timeline: { label: string; time: string; done: boolean }[];
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: string;
  engine: string;
  plate: string;
  color: string;
}

export interface AppNotification {
  id: string;
  kind: "booking" | "message" | "promo" | "announcement";
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const coverPool = [
  "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80",
];

const galleryPool = [
  "https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1632823469850-1b7b1e8b7e3e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1567818735868-e71b99932e29?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1599256872237-5dcc0fbe9668?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
];

export const quickServices: QuickService[] = [
  {
    id: "engine",
    name: "Engine repair",
    icon: "Cog",
    from: 350000,
    color: "primary",
  },
  {
    id: "oil",
    name: "Oil change",
    icon: "Droplets",
    from: 120000,
    color: "info",
  },
  {
    id: "battery",
    name: "Battery",
    icon: "BatteryCharging",
    from: 90000,
    color: "success",
  },
  {
    id: "electrical",
    name: "Electrical",
    icon: "Zap",
    from: 150000,
    color: "warning",
  },
  {
    id: "diagnostics",
    name: "Diagnostics",
    icon: "Gauge",
    from: 80000,
    color: "primary",
  },
  {
    id: "tire",
    name: "Tire service",
    icon: "CircleDot",
    from: 60000,
    color: "info",
  },
  {
    id: "wash",
    name: "Car Wash",
    icon: "SprayCan",
    from: 45000,
    color: "success",
  },
  {
    id: "ac",
    name: "Air Conditioner",
    icon: "Snowflake",
    from: 180000,
    color: "info",
  },
  {
    id: "brake",
    name: "Brake service",
    icon: "Disc3",
    from: 210000,
    color: "warning",
  },
  {
    id: "sos",
    name: "Emergency Help",
    icon: "LifeBuoy",
    from: 100000,
    color: "destructive",
  },
  {
    id: "other",
    name: "Other services",
    icon: "Wrench",
    from: 50000,
    color: "primary",
  },
];

const names: [string, string, string, string][] = [
  ["Avto Master Servis", "Shuhrat Nazarov", "Chilanzar 12", "Chilanzar"],
  ["Turbo Garage", "Aziz Yusupov", "Yunusabad 4", "Yunusabad"],
  ["ProFix Motors", "Davron Qosimov", "Amir Temur 88", "Mirzo Ulugbek"],
  ["Elite Auto Care", "Bahodir Salimov", "Bunyodkor 45", "Uchtepa"],
  ["Speed Line Service", "Ulugbek Rasulov", "Navoi 21", "Shayxontohur"],
  ["Nur Avto Servis", "Rustam Ibragimov", "Sebzor 19", "Olmazor"],
  ["Mega Motors", "Elyor Sultonov", "Bog'ishamol 9", "Mirzo Ulugbek"],
  ["City Auto Hub", "Jamshid Karimov", "Do'stlik 30", "Yashnobod"],
];

const allServices = quickServices.map((s) => s.name);

export const mechanics: MechanicProfile[] = names.map(([name, owner, address, district], i) => ({
  id: `m-${i + 1}`,
  name,
  owner,
  cover: coverPool[i % coverPool.length],
  logo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=16a34a&textColor=ffffff`,
  distanceKm: Number(
    [3.8, 14.5, 38.0, 72.0, 115.0, 185.0, 260.0, 340.0, 420.0, 475.0, 8.2, 54.0][i % 12].toFixed(1),
  ),
  rating: Number((4.2 + ((i * 3) % 8) / 10).toFixed(1)),
  reviewCount: 48 + i * 37,
  open: i % 4 !== 3,
  startingPrice: [
    80000, 150000, 350000, 500000, 750000, 950000, 1200000, 1450000, 1800000, 220000, 450000,
    680000,
  ][i % 12],
  verified: i % 5 !== 4,
  experienceYears: 4 + (i % 12),
  address: `${address}, Tashkent`,
  district,
  phone: `+998 9${(i + 1) % 9} ${300 + i} ${40 + i} ${11 + i}`,
  hours: [
    { day: "Mon – Fri", time: "09:00 – 20:00" },
    { day: "Saturday", time: "09:00 – 18:00" },
    { day: "Sunday", time: i % 4 === 3 ? "Closed" : "10:00 – 16:00" },
  ],
  services: [
    allServices[i % allServices.length],
    allServices[(i + 2) % allServices.length],
    allServices[(i + 4) % allServices.length],
    allServices[(i + 6) % allServices.length],
  ],
  vehicleTypes:
    i % 3 === 0
      ? [
          "Yengil mashinalar",
          "Cobalt",
          "Gentra",
          "Nexia",
          "Spark",
          "Matiz",
          "Damas",
          "Sedan",
          "Hatchback",
        ]
      : i % 3 === 1
        ? [
            "Yengil mashinalar",
            "Chet el mashinalari",
            "Tracker",
            "Malibu",
            "Onix",
            "Cobalt",
            "Gentra",
            "Krossover",
            "Sedan",
          ]
        : [
            "Yuk mashinalari",
            "Yengil mashinalar",
            "Damas",
            "Labo",
            "Truck",
            "Miniven",
            "Cobalt",
            "Nexia",
          ],
  priceList: [
    { label: "Full diagnostics", price: 80000 + i * 5000, duration: "45 min" },
    { label: "Oil & filter change", price: 130000 + i * 6000, duration: "1 h" },
    { label: "Brake pads replacement", price: 260000 + i * 9000, duration: "1.5 h" },
    { label: "AC refill", price: 190000 + i * 7000, duration: "1 h" },
  ],
  gallery: [
    galleryPool[i % galleryPool.length],
    galleryPool[(i + 1) % galleryPool.length],
    galleryPool[(i + 2) % galleryPool.length],
    galleryPool[(i + 3) % galleryPool.length],
  ],
  reviews: Array.from({ length: 3 }, (_, r) => ({
    id: `m-${i + 1}-r-${r}`,
    author: ["Umar Sattorov", "Dilnoza Yusupova", "Sardor Rakhimov", "Malika Tosheva"][(i + r) % 4],
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${(i + r) % 4}&backgroundColor=E2E8F0&textColor=0f172a`,
    rating: 5 - ((i + r) % 2),
    date: `${2 + r} days ago`,
    text: [
      "Fast, transparent pricing and the car feels brand new.",
      "Booked in the app, arrived and was served in 5 minutes.",
      "Professional team, clean workshop, will definitely return.",
    ][r],
  })),
  lat: 41.31 + i * 0.01,
  lng: 69.24 + i * 0.012,
}));

export const popularServices = quickServices.slice(0, 8).map((s, i) => ({
  ...s,
  bookings: 1240 - i * 120,
}));

export const offers = [
  {
    id: "of-1",
    title: "20% off first booking",
    subtitle: "New to UstaGo? Your first service is on us.",
    cta: "Claim offer",
    image: coverPool[0],
    accent: "from-primary to-info",
  },
  {
    id: "of-2",
    title: "Free diagnostics week",
    subtitle: "Full 45-point check at partner workshops.",
    cta: "Find a workshop",
    image: coverPool[1],
    accent: "from-info to-success",
  },
  {
    id: "of-3",
    title: "Winter tire package",
    subtitle: "Change + balance + storage from 240 000 so'm.",
    cta: "See deals",
    image: coverPool[3],
    accent: "from-warning to-primary",
  },
];

export const initialVehicles: Vehicle[] = [
  {
    id: "v-1",
    brand: "Chevrolet",
    model: "Malibu 2",
    year: "2022",
    engine: "1.5 Turbo",
    plate: "01 A 777 BA",
    color: "Black",
  },
  {
    id: "v-2",
    brand: "Toyota",
    model: "Camry 70",
    year: "2019",
    engine: "2.5 Hybrid",
    plate: "01 C 145 KA",
    color: "White",
  },
];

export const initialBookings: CustomerBooking[] = [
  {
    id: "BKG-8841",
    mechanicId: "m-1",
    mechanic: "Avto Master Servis",
    service: "Full diagnostics",
    date: "Tue, 28 Jul 2026",
    time: "10:30",
    price: 80000,
    state: "upcoming",
    vehicle: "Chevrolet Malibu 2 · 01 A 777 BA",
    timeline: [
      { label: "Booking requested", time: "26 Jul, 18:04", done: true },
      { label: "Confirmed by workshop", time: "26 Jul, 18:26", done: true },
      { label: "Vehicle in service", time: "Pending", done: false },
      { label: "Completed", time: "Pending", done: false },
    ],
  },
  {
    id: "BKG-8830",
    mechanicId: "m-3",
    mechanic: "ProFix Motors",
    service: "Oil & filter change",
    date: "Fri, 31 Jul 2026",
    time: "15:00",
    price: 145000,
    state: "upcoming",
    vehicle: "Toyota Camry 70 · 01 C 145 KA",
    timeline: [
      { label: "Booking requested", time: "25 Jul, 09:12", done: true },
      { label: "Confirmed by workshop", time: "25 Jul, 09:40", done: true },
      { label: "Vehicle in service", time: "Pending", done: false },
      { label: "Completed", time: "Pending", done: false },
    ],
  },
  {
    id: "BKG-8712",
    mechanicId: "m-2",
    mechanic: "Turbo Garage",
    service: "Brake pads replacement",
    date: "Mon, 13 Jul 2026",
    time: "11:00",
    price: 268000,
    state: "completed",
    vehicle: "Chevrolet Malibu 2 · 01 A 777 BA",
    timeline: [
      { label: "Booking requested", time: "11 Jul, 20:02", done: true },
      { label: "Confirmed by workshop", time: "11 Jul, 20:15", done: true },
      { label: "Vehicle in service", time: "13 Jul, 11:05", done: true },
      { label: "Completed", time: "13 Jul, 12:40", done: true },
    ],
  },
  {
    id: "BKG-8655",
    mechanicId: "m-5",
    mechanic: "Speed Line Service",
    service: "AC refill",
    date: "Wed, 24 Jun 2026",
    time: "13:30",
    price: 190000,
    state: "cancelled",
    vehicle: "Toyota Camry 70 · 01 C 145 KA",
    timeline: [
      { label: "Booking requested", time: "22 Jun, 10:00", done: true },
      { label: "Cancelled by you", time: "23 Jun, 08:11", done: true },
    ],
  },
];

export const notifications: AppNotification[] = [
  {
    id: "n-1",
    kind: "booking",
    title: "Booking confirmed",
    body: "Avto Master Servis confirmed your diagnostics for Tue, 10:30.",
    time: "12 min ago",
    unread: true,
  },
  {
    id: "n-2",
    kind: "message",
    title: "Message from ProFix Motors",
    body: "Please bring the service book with you, thanks!",
    time: "2 h ago",
    unread: true,
  },
  {
    id: "n-3",
    kind: "promo",
    title: "20% off your next oil change",
    body: "Valid at 24 partner workshops until 31 August.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "n-4",
    kind: "announcement",
    title: "UstaGo 2.4 is here",
    body: "Faster booking flow and live mechanic tracking on the map.",
    time: "3 days ago",
    unread: false,
  },
];

export const customer = {
  name: "Umar Sattorov",
  firstName: "Umar",
  phone: "+998 90 123 45 67",
  email: "umar.sattorov@gmail.com",
  avatar:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  city: "Tashkent",
  memberSince: "2024",
};

export const formatSom = (v: number) => `${v.toLocaleString("en-US").replace(/,/g, " ")} so'm`;
