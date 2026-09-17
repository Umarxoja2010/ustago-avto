export interface MechanicJob {
  id: string;
  customer: string;
  avatar: string;
  service: string;
  vehicle: string;
  date: string;
  time: string;
  price: number;
  address: string;
  note?: string;
  state: "request" | "active" | "completed" | "rejected";
}

export interface ShopService {
  id: string;
  name: string;
  price: number;
  duration: string;
  active: boolean;
}

export interface WorkingHour {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface ShopReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  service: string;
}

export interface ShopMessage {
  id: string;
  author: string;
  avatar: string;
  preview: string;
  time: string;
  unread: boolean;
}

export interface ShopNotification {
  id: string;
  kind: "job" | "review" | "system";
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=2563EB&textColor=ffffff`;

export const workshop = {
  id: "shop-1",
  name: "Avto Master Servis",
  owner: "Shuhrat Nazarov",
  phone: "+998 90 000 00 03",
  address: "Chilanzar 12, Tashkent",
  district: "Chilanzar",
  about:
    "Full-service workshop with 8 years of experience in engine repair, diagnostics and quick maintenance for European and Asian cars.",
  rating: 4.8,
  reviewCount: 214,
  verified: true,
  experienceYears: 8,
  cover:
    "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=80",
  logo: avatar("Avto Master Servis"),
};

export const gallery = [
  "https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1599256872237-5dcc0fbe9668?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=1200&q=80",
];

const customers: [string, string, string][] = [
  ["Aziz Karimov", "Chevrolet Malibu 2021", "Yunusabad 8, Tashkent"],
  ["Dilnoza Yusupova", "Kia Sportage 2019", "Chilanzar 20, Tashkent"],
  ["Sardor Rakhimov", "Lacetti 2016", "Sergeli 5, Tashkent"],
  ["Malika Tosheva", "Hyundai Sonata 2022", "Mirzo Ulugbek 14, Tashkent"],
  ["Jasur Aliyev", "Cobalt 2020", "Uchtepa 3, Tashkent"],
  ["Nodira Ismoilova", "Nexia 3 2018", "Shayxontohur 9, Tashkent"],
  ["Bekzod Ergashev", "Toyota Camry 2017", "Yashnobod 22, Tashkent"],
  ["Zilola Nazarova", "Spark 2015", "Olmazor 6, Tashkent"],
];

const serviceNames = [
  "Engine diagnostics",
  "Oil change",
  "Brake pads replacement",
  "AC refill",
  "Battery replacement",
  "Suspension repair",
  "Tire change",
  "Full inspection",
];

const states: MechanicJob["state"][] = [
  "request",
  "request",
  "request",
  "active",
  "active",
  "completed",
  "completed",
  "completed",
];

export const initialJobs: MechanicJob[] = customers.map(([name, vehicle, address], i) => ({
  id: `JOB-${1200 + i}`,
  customer: name,
  avatar: avatar(name),
  service: serviceNames[i],
  vehicle,
  date: `2026-07-${String(28 + (i % 3)).padStart(2, "0")}`,
  time: `${String(9 + i).padStart(2, "0")}:30`,
  price: 120000 + i * 65000,
  address,
  note: i % 3 === 0 ? "Strange noise when braking at low speed." : undefined,
  state: states[i],
}));

export const initialServices: ShopService[] = [
  { id: "s-1", name: "Engine diagnostics", price: 80000, duration: "45 min", active: true },
  { id: "s-2", name: "Oil change", price: 120000, duration: "30 min", active: true },
  {
    id: "s-3",
    name: "Brake pads replacement",
    price: 260000,
    duration: "1 h 30 min",
    active: true,
  },
  { id: "s-4", name: "AC refill", price: 180000, duration: "1 h", active: true },
  { id: "s-5", name: "Suspension repair", price: 420000, duration: "3 h", active: false },
];

export const initialHours: WorkingHour[] = [
  { day: "Monday", open: "09:00", close: "19:00", closed: false },
  { day: "Tuesday", open: "09:00", close: "19:00", closed: false },
  { day: "Wednesday", open: "09:00", close: "19:00", closed: false },
  { day: "Thursday", open: "09:00", close: "19:00", closed: false },
  { day: "Friday", open: "09:00", close: "19:00", closed: false },
  { day: "Saturday", open: "10:00", close: "16:00", closed: false },
  { day: "Sunday", open: "10:00", close: "16:00", closed: true },
];

export const shopReviews: ShopReview[] = [
  {
    id: "r-1",
    author: "Aziz Karimov",
    avatar: avatar("Aziz Karimov"),
    rating: 5,
    date: "24 Jul 2026",
    service: "Engine diagnostics",
    text: "Found the problem in 20 minutes and explained everything clearly. Great workshop.",
  },
  {
    id: "r-2",
    author: "Malika Tosheva",
    avatar: avatar("Malika Tosheva"),
    rating: 5,
    date: "19 Jul 2026",
    service: "Oil change",
    text: "Fast, clean and fair pricing. Will definitely come back.",
  },
  {
    id: "r-3",
    author: "Sardor Rakhimov",
    avatar: avatar("Sardor Rakhimov"),
    rating: 4,
    date: "12 Jul 2026",
    service: "Brake pads replacement",
    text: "Good job on the brakes, waited a bit longer than promised.",
  },
  {
    id: "r-4",
    author: "Nodira Ismoilova",
    avatar: avatar("Nodira Ismoilova"),
    rating: 5,
    date: "05 Jul 2026",
    service: "AC refill",
    text: "Air conditioner works like new. Very professional team.",
  },
];

export const shopMessages: ShopMessage[] = [
  {
    id: "m-1",
    author: "Aziz Karimov",
    avatar: avatar("Aziz Karimov"),
    preview: "Can I bring the car 30 minutes earlier tomorrow?",
    time: "12:40",
    unread: true,
  },
  {
    id: "m-2",
    author: "Dilnoza Yusupova",
    avatar: avatar("Dilnoza Yusupova"),
    preview: "Thanks! The engine sounds much better now.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "m-3",
    author: "Bekzod Ergashev",
    avatar: avatar("Bekzod Ergashev"),
    preview: "How much for a full inspection on a Camry?",
    time: "Mon",
    unread: true,
  },
];

export const shopNotifications: ShopNotification[] = [
  {
    id: "n-1",
    kind: "job",
    title: "New booking request",
    body: "Aziz Karimov requested Engine diagnostics for tomorrow 09:30.",
    time: "10 min ago",
    unread: true,
  },
  {
    id: "n-2",
    kind: "review",
    title: "New 5-star review",
    body: "Malika Tosheva rated your Oil change service 5 stars.",
    time: "2 h ago",
    unread: true,
  },
  {
    id: "n-4",
    kind: "system",
    title: "Verification renewed",
    body: "Your workshop licence was verified for another 12 months.",
    time: "3 days ago",
    unread: false,
  },
];

export const formatSom = (value: number) =>
  `${value.toLocaleString("en-US").replace(/,/g, " ")} so'm`;
