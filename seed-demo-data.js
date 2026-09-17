#!/usr/bin/env node

/**
 * Demo Data Seeder for UstaGo Avto
 * Creates:
 * - 100 ordinary users (customers)
 * - 10 mechanics (masters) with shops
 * - Services for mechanics
 * - Bookings/Orders between users and mechanics
 * - Reviews and ratings
 * - Notifications
 */

const BASE_URL = "http://localhost:8000/api";

// Uzbek names and locations
const uzbek_first_names = [
  "Ali",
  "Alisher",
  "Akmal",
  "Aziz",
  "Bekzod",
  "Davron",
  "Dilshod",
  "Fahim",
  "Gulnoza",
  "Husan",
  "Ibragim",
  "Jamoliddin",
  "Karim",
  "Layla",
  "Mansur",
  "Nazar",
  "Olim",
  "Pakizada",
  "Qasim",
  "Rashid",
  "Salim",
  "Tohir",
  "Umar",
  "Vali",
  "Yashin",
  "Zarif",
  "Abdulaziz",
  "Bobur",
  "Chingiz",
  "Dilmurat",
];

const uzbek_last_names = [
  "Abdullayev",
  "Alibekov",
  "Babayev",
  "Boymurodov",
  "Chernyshov",
  "Dadayev",
  "Egorova",
  "Fedorov",
  "Gazieva",
  "Habibov",
  "Ibragimov",
  "Janiyev",
  "Karimov",
  "Leshchenko",
  "Maksudov",
  "Nazarov",
  "Orazov",
  "Petrov",
  "Qahqaev",
  "Raxmanov",
  "Sadikov",
  "Temirov",
  "Umarov",
  "Voronov",
];

const cities = [
  "Toshkent",
  "Samarqand",
  "Buxoro",
  "Xiva",
  "Farg'ona",
  "Andijon",
  "Namangan",
  "Qoqon",
  "Qashqadarya",
  "Surxandarya",
  "Xorazm",
  "Jizzax",
  "Qoraqalpog'iston",
];

const shop_names = [
  "Ali's Auto Repair",
  "Samarqand Motors",
  "Buxoro Service",
  "Toshkent Tech",
  "Farg'ona Fix",
  "Andijon Auto",
  "Namangan Service",
  "Qoqon Garage",
  "Royal Motors",
  "Premium Auto Care",
  "Express Auto",
  "Master's Workshop",
];

// Utility functions
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEmail(firstName, lastName, index) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@mail.com`;
}

function generatePhone() {
  return `+998${random(88, 99)}${random(100, 999)}${random(1000, 9999)}`;
}

async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const json = await response.json();

    if (!response.ok) {
      console.error(`❌ ${method} ${endpoint}:`, json);
      return null;
    }

    return json.data || json;
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    return null;
  }
}

async function registerUser(firstName, lastName, index, role = "customer") {
  const email = generateEmail(firstName, lastName, index);
  const phone = generatePhone();

  const payload = {
    role,
    name: `${firstName} ${lastName}`,
    phone,
    email,
    password: "demo1234",
    password_confirmation: "demo1234",
  };

  if (role === "mechanic") {
    const city = randomItem(cities);
    payload.workshop = {
      name: randomItem(shop_names),
      address: `${random(1, 500)} Street`,
      city,
      experience: `${random(1, 15)} years`,
      services: "Engine repair, Oil change, Diagnostics",
    };
  }

  const result = await makeRequest("POST", "/auth/register", payload);

  if (result && result.user && result.token) {
    return {
      user: result.user,
      token: result.token,
    };
  }

  return null;
}

async function loginUser(email, password) {
  const result = await makeRequest("POST", "/auth/login", { identifier: email, password });
  if (result && result.token) {
    return result.token;
  }
  return null;
}

async function getServiceCatalog() {
  const result = await makeRequest("GET", "/services");
  return result || [];
}

async function addServiceToMechanic(serviceId, price, duration, token) {
  const payload = {
    service_id: serviceId,
    price,
    duration: `${duration}h`,
  };
  return await makeRequest("POST", "/master/services", payload, token);
}

async function createBooking(masterId, vehicleId, serviceIds, price, token) {
  const payload = {
    master_id: masterId,
    vehicle_id: vehicleId,
    service_ids: serviceIds,
    price,
    description: "Demo booking",
  };
  return await makeRequest("POST", "/bookings", payload, token);
}

async function updateBookingStatus(bookingId, status, token) {
  const payload = { status };
  return await makeRequest("PATCH", `/bookings/${bookingId}`, payload, token);
}

async function createVehicle(brand, model, year, token) {
  const payload = {
    brand,
    model,
    year,
    license_plate: `${random(100, 999)}${String.fromCharCode(65 + random(0, 25))}${String.fromCharCode(65 + random(0, 25))}`,
  };
  return await makeRequest("POST", "/vehicles", payload, token);
}

async function createReview(masterId, bookingId, rating, comment, token) {
  const payload = {
    master_id: masterId,
    booking_id: bookingId,
    rating,
    comment,
  };
  return await makeRequest("POST", "/reviews", payload, token);
}

async function main() {
  console.log("\n🚀 Starting Demo Data Seeder for UstaGo Avto\n");

  let users = [];
  let mechanics = [];
  let services = [];

  // Step 1: Get service catalog
  console.log("📋 Fetching service catalog...");
  services = await getServiceCatalog();
  if (services.length === 0) {
    console.error("❌ No services found in catalog. Exiting.");
    return;
  }
  console.log(`✅ Found ${services.length} services`);

  // Step 2: Create 100 customer users
  console.log("\n👥 Creating 100 customer users...");
  for (let i = 1; i <= 100; i++) {
    const firstName = randomItem(uzbek_first_names);
    const lastName = randomItem(uzbek_last_names);
    const result = await registerUser(firstName, lastName, i, "customer");

    if (result) {
      users.push(result);
      if (i % 10 === 0) console.log(`  ✅ ${i} users created`);
    }
  }
  console.log(`✅ Total customers: ${users.length}`);

  // Step 3: Create 10 mechanics
  console.log("\n🔧 Creating 10 mechanics...");
  for (let i = 1; i <= 10; i++) {
    const firstName = randomItem(uzbek_first_names);
    const lastName = randomItem(uzbek_last_names);
    const result = await registerUser(firstName, lastName, i + 100, "mechanic");

    if (result) {
      mechanics.push(result);

      // Add 3-5 services to each mechanic
      const numServices = random(3, 5);
      const selectedServices = [];
      for (let j = 0; j < numServices; j++) {
        const service = randomItem(services);
        const price = random(50000, 500000);
        await addServiceToMechanic(service.id, price, random(1, 4), result.token);
        selectedServices.push(service);
      }
      console.log(`  ✅ Mechanic ${i} created with ${numServices} services`);
    }
  }
  console.log(`✅ Total mechanics: ${mechanics.length}`);

  // Step 4: Create vehicles for customers
  console.log("\n🚗 Creating vehicles for customers...");
  const car_brands = [
    "Toyota",
    "Hyundai",
    "Chevrolet",
    "Daewoo",
    "BMW",
    "Mercedes",
    "Audi",
    "Honda",
    "Nissan",
    "KIA",
  ];
  const car_models = [
    "Camry",
    "Accent",
    "Spark",
    "Matiz",
    "320i",
    "C200",
    "A4",
    "Civic",
    "Altima",
    "Forte",
  ];

  const customerVehicles = [];
  for (let i = 0; i < Math.min(50, users.length); i++) {
    const user = users[i];
    const brand = randomItem(car_brands);
    const model = randomItem(car_models);
    const year = random(2010, 2024);

    const vehicle = await createVehicle(brand, model, year, user.token);
    if (vehicle) {
      customerVehicles.push({ user, vehicle });
    }
  }
  console.log(`✅ Created ${customerVehicles.length} vehicles`);

  // Step 5: Create bookings (orders)
  console.log("\n📅 Creating bookings...");
  const booking_statuses = ["completed", "completed", "completed", "active", "rejected"];
  let bookings = [];

  for (let i = 0; i < Math.min(50, customerVehicles.length); i++) {
    const { user, vehicle } = customerVehicles[i];
    const mechanic = randomItem(mechanics);
    const numServices = random(1, 3);
    const serviceIds = [];
    let totalPrice = 0;

    for (let j = 0; j < numServices; j++) {
      const service = randomItem(services);
      serviceIds.push(service.id);
      totalPrice += random(50000, 300000);
    }

    const booking = await createBooking(
      mechanic.user.id,
      vehicle.id,
      serviceIds,
      totalPrice,
      user.token,
    );
    if (booking) {
      bookings.push({ booking, user, mechanic, status: randomItem(booking_statuses) });
    }
  }
  console.log(`✅ Created ${bookings.length} bookings`);

  // Step 6: Update booking statuses and create reviews
  console.log("\n⭐ Updating booking statuses and creating reviews...");
  for (const { booking, user, mechanic, status } of bookings) {
    // Update status
    await updateBookingStatus(booking.id, status, user.token);

    // Create review if booking is completed
    if (status === "completed") {
      const rating = random(3, 5);
      const comments = [
        "Juda yaxshi xizmat!",
        "Mehnati ko'p, rahmat!",
        "Ajoyib natija, tavsiya etaman",
        "Tez va shoh-shohcha ishi",
        "Shunga ko'ra bahali, lekin sifati yaxshi",
      ];

      const review = await createReview(
        mechanic.user.id,
        booking.id,
        rating,
        randomItem(comments),
        user.token,
      );

      if (review) {
        console.log(`  ✅ Review created: ${rating}⭐ from ${user.user.name}`);
      }
    }
  }

  // Step 7: Summary
  console.log("\n" + "=".repeat(60));
  console.log("✅ DEMO DATA SEEDING COMPLETE!");
  console.log("=".repeat(60));
  console.log(`
📊 Summary:
  • Customers: ${users.length}
  • Mechanics: ${mechanics.length}
  • Services: ${services.length}
  • Vehicles: ${customerVehicles.length}
  • Bookings: ${bookings.length}
  • Reviews: ${bookings.filter((b) => b.status === "completed").length}

🔐 Test Credentials (Sample):
  Customer: ${users[0]?.user.email || "N/A"} | Password: demo1234
  Mechanic: ${mechanics[0]?.user.email || "N/A"} | Password: demo1234

🌐 Access at: http://localhost:8080/

👉 You can now:
   - Login as a customer and browse mechanics
   - Book services
   - Leave reviews
   - Check notifications
   - View mechanic profiles and schedules
  `);
}

main().catch(console.error);
