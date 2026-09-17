/**
 * Demo Mode Manager for UstaGo Avto
 * Creates mock data in localStorage when backend is not available
 */

const DEMO_DATA_KEY = "ustago.demo_data";
const DEMO_USERS_KEY = "ustago.demo_users";
const DEMO_MECHANICS_KEY = "ustago.demo_mechanics";
const DEMO_BOOKINGS_KEY = "ustago.demo_bookings";
const DEMO_REVIEWS_KEY = "ustago.demo_reviews";

// Uzbek names for realistic data
const FIRST_NAMES = [
  "Ali",
  "Alisher",
  "Aziz",
  "Bekzod",
  "Davron",
  "Dilshod",
  "Gulnoza",
  "Husan",
  "Ibragim",
  "Karim",
  "Layla",
  "Mansur",
  "Nazar",
  "Olim",
  "Qasim",
  "Rashid",
  "Salim",
  "Tohir",
];

const LAST_NAMES = [
  "Abdullayev",
  "Alibekov",
  "Babayev",
  "Boymurodov",
  "Chernyshov",
  "Egorova",
  "Fedorov",
  "Gazieva",
  "Habibov",
  "Ibragimov",
  "Karimov",
  "Leshchenko",
  "Maksudov",
  "Nazarov",
  "Orazov",
];

const CITIES = [
  "Toshkent",
  "Samarqand",
  "Buxoro",
  "Farg'ona",
  "Andijon",
  "Namangan",
  "Qoqon",
  "Qashqadarya",
  "Xorazm",
];

const SHOP_NAMES = [
  "Ali's Auto Repair",
  "Samarqand Motors",
  "Buxoro Service",
  "Royal Motors",
  "Premium Auto Care",
  "Express Auto",
];

const SERVICES = [
  { id: 1, name: "Engine repair", slug: "engine-repair" },
  { id: 2, name: "Oil change", slug: "oil-change" },
  { id: 3, name: "Brake repair", slug: "brake-repair" },
  { id: 4, name: "Diagnostics", slug: "diagnostics" },
  { id: 5, name: "Tire fitting", slug: "tire-fitting" },
];

const CAR_BRANDS = ["Toyota", "Hyundai", "Chevrolet", "BMW", "Mercedes", "Honda"];
const CAR_MODELS = ["Camry", "Accent", "Spark", "320i", "C200", "Civic"];

const REVIEW_COMMENTS = [
  "Juda yaxshi xizmat!",
  "Mehnati ko'p, rahmat!",
  "Ajoyib natija, tavsiya etaman",
  "Tez va shoh-shohcha ishi",
  "Professionali usta",
];

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEmail(firstName: string, lastName: string, index: number): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@mail.com`;
}

function generatePhone(): string {
  return `+998${random(88, 99)}${random(100, 999)}${random(1000, 9999)}`;
}

function generateAvatar(name: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=2563EB&textColor=ffffff`;
}

function generateLicensePlate(): string {
  return `${random(100, 999)}${String.fromCharCode(65 + random(0, 25))}${String.fromCharCode(65 + random(0, 25))}`;
}

function createDemoUsers(count = 100) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);
    const email = generateEmail(firstName, lastName, i);

    users.push({
      id: i + 1,
      name: `${firstName} ${lastName}`,
      email,
      phone: generatePhone(),
      password: "demo1234",
      role: "customer",
      avatar: generateAvatar(`${firstName} ${lastName}`),
      city: randomItem(CITIES),
      createdAt: new Date(Date.now() - random(1, 365) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  return users;
}

function createDemoMechanics(count = 10) {
  const mechanics = [];
  for (let i = 0; i < count; i++) {
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);
    const email = generateEmail(firstName, lastName, 100 + i);
    const numServices = random(3, 5);
    const selectedServices = [];

    for (let j = 0; j < numServices; j++) {
      selectedServices.push(randomItem(SERVICES));
    }

    mechanics.push({
      id: 100 + i + 1,
      name: `${firstName} ${lastName}`,
      email,
      phone: generatePhone(),
      password: "demo1234",
      role: "mechanic",
      avatar: generateAvatar(`${firstName} ${lastName}`),
      workshop: {
        id: i + 1,
        name: randomItem(SHOP_NAMES),
        address: `${random(1, 500)} Street`,
        city: randomItem(CITIES),
        experience: `${random(1, 15)} years`,
      },
      services: selectedServices.map((s) => ({
        ...s,
        price: random(50000, 500000),
        duration: `${random(1, 4)}h`,
      })),
      rating: random(38, 50) / 10,
      reviewCount: random(5, 50),
      isOpen: Math.random() > 0.3,
      createdAt: new Date(Date.now() - random(1, 365) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  return mechanics;
}

function createDemoVehicles(users: Array<{ id: number }>) {
  const vehicles = [];
  for (let i = 0; i < Math.min(50, users.length); i++) {
    vehicles.push({
      id: i + 1,
      userId: users[i].id,
      brand: randomItem(CAR_BRANDS),
      model: randomItem(CAR_MODELS),
      year: random(2010, 2024),
      licensePlate: generateLicensePlate(),
      createdAt: new Date().toISOString(),
    });
  }
  return vehicles;
}

function createDemoBookings(
  users: Array<{ id: number }>,
  mechanics: Array<{
    id: number;
    services: Array<{ id: number; name: string; slug: string; price: number; duration: string }>;
  }>,
  vehicles: Array<{ id: number; userId: number }>,
) {
  const bookings = [];
  const statuses = ["completed", "completed", "completed", "active", "rejected"];

  for (let i = 0; i < Math.min(50, vehicles.length); i++) {
    const user = users.find((u) => u.id === vehicles[i]?.userId);
    if (!user) continue;
    const mechanic = randomItem(mechanics);
    const numServices = random(1, 3);
    const selectedServices = [];
    let totalPrice = 0;

    for (let j = 0; j < numServices; j++) {
      const service = randomItem(mechanic.services);
      selectedServices.push(service);
      totalPrice += service.price;
    }

    bookings.push({
      id: i + 1,
      customerId: user.id,
      mechanicId: mechanic.id,
      vehicleId: vehicles[i].id,
      services: selectedServices,
      price: totalPrice,
      status: randomItem(statuses),
      description: "Demo booking",
      date: new Date(Date.now() + random(-30, 30) * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    });
  }
  return bookings;
}

function createDemoReviews(
  bookings: Array<{ id: number; customerId: number; mechanicId: number; status: string }>,
  _mechanics: unknown,
) {
  const reviews = [];
  const completedBookings = bookings.filter((b) => b.status === "completed");

  for (const booking of completedBookings.slice(0, 30)) {
    reviews.push({
      id: reviews.length + 1,
      customerId: booking.customerId,
      mechanicId: booking.mechanicId,
      bookingId: booking.id,
      rating: random(3, 5),
      comment: randomItem(REVIEW_COMMENTS),
      createdAt: new Date().toISOString(),
    });
  }
  return reviews;
}

export function initializeDemoMode() {
  console.log("🚀 Initializing Demo Mode...\n");

  const users = createDemoUsers(100);
  const mechanics = createDemoMechanics(10);
  const vehicles = createDemoVehicles(users);
  const bookings = createDemoBookings(users, mechanics, vehicles);
  const reviews = createDemoReviews(bookings, mechanics);

  try {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
    localStorage.setItem(DEMO_MECHANICS_KEY, JSON.stringify(mechanics));
    localStorage.setItem(DEMO_BOOKINGS_KEY, JSON.stringify(bookings));
    localStorage.setItem(DEMO_REVIEWS_KEY, JSON.stringify(reviews));
    localStorage.setItem(DEMO_DATA_KEY, "true");

    console.log("✅ DEMO DATA INITIALIZED!");
    return { users, mechanics, vehicles, bookings, reviews };
  } catch (error) {
    console.error("❌ Failed to save demo data:", error);
    return null;
  }
}

export function getDemoUsers() {
  try {
    const data = localStorage.getItem(DEMO_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getDemoMechanics() {
  try {
    const data = localStorage.getItem(DEMO_MECHANICS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getDemoBookings() {
  try {
    const data = localStorage.getItem(DEMO_BOOKINGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getDemoReviews() {
  try {
    const data = localStorage.getItem(DEMO_REVIEWS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function isDemoModeEnabled() {
  return localStorage.getItem(DEMO_DATA_KEY) === "true";
}

export function clearDemoData() {
  localStorage.removeItem(DEMO_DATA_KEY);
  localStorage.removeItem(DEMO_USERS_KEY);
  localStorage.removeItem(DEMO_MECHANICS_KEY);
  localStorage.removeItem(DEMO_BOOKINGS_KEY);
  localStorage.removeItem(DEMO_REVIEWS_KEY);
  console.log("🧹 Demo data cleared");
}

export function autoInitializeDemoMode() {
  if (typeof window === "undefined") return;

  if (isDemoModeEnabled()) {
    return;
  }

  const existingUsers = getDemoUsers();
  if (existingUsers.length > 0) {
    localStorage.setItem(DEMO_DATA_KEY, "true");
    return;
  }

  try {
    initializeDemoMode();
    console.log("✅ Demo data auto-initialized on first load");
  } catch (error) {
    console.error("❌ Failed to auto-initialize demo data:", error);
  }
}
