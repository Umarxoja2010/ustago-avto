#!/usr/bin/env python3

"""
Demo Data Seeder for UstaGo Avto
Creates: 100 users, 10 mechanics, services, bookings, reviews, notifications
"""

import requests
import random
import json
from typing import List, Dict, Optional

BASE_URL = "http://localhost:8000/api"

# Uzbek names
UZBEK_FIRST_NAMES = [
    "Ali", "Alisher", "Akmal", "Aziz", "Bekzod", "Davron", "Dilshod", "Fahim",
    "Gulnoza", "Husan", "Ibragim", "Jamoliddin", "Karim", "Layla", "Mansur",
    "Nazar", "Olim", "Pakizada", "Qasim", "Rashid", "Salim", "Tohir", "Umar",
    "Vali", "Yashin", "Zarif", "Abdulaziz", "Bobur", "Chingiz", "Dilmurat",
]

UZBEK_LAST_NAMES = [
    "Abdullayev", "Alibekov", "Babayev", "Boymurodov", "Chernyshov", "Dadayev",
    "Egorova", "Fedorov", "Gazieva", "Habibov", "Ibragimov", "Janiyev",
    "Karimov", "Leshchenko", "Maksudov", "Nazarov", "Orazov", "Petrov",
    "Qahqaev", "Raxmanov", "Sadikov", "Temirov", "Umarov", "Voronov",
]

CITIES = [
    "Toshkent", "Samarqand", "Buxoro", "Xiva", "Farg'ona", "Andijon", "Namangan",
    "Qoqon", "Qashqadarya", "Surxandarya", "Xorazm", "Jizzax", "Qoraqalpog'iston",
]

SHOP_NAMES = [
    "Ali's Auto Repair", "Samarqand Motors", "Buxoro Service", "Toshkent Tech",
    "Farg'ona Fix", "Andijon Auto", "Namangan Service", "Qoqon Garage",
    "Royal Motors", "Premium Auto Care", "Express Auto", "Master's Workshop",
]

CAR_BRANDS = ["Toyota", "Hyundai", "Chevrolet", "Daewoo", "BMW", "Mercedes", "Audi", "Honda", "Nissan", "KIA"]
CAR_MODELS = ["Camry", "Accent", "Spark", "Matiz", "320i", "C200", "A4", "Civic", "Altima", "Forte"]

REVIEW_COMMENTS = [
    "Juda yaxshi xizmat!",
    "Mehnati ko'p, rahmat!",
    "Ajoyib natija, tavsiya etaman",
    "Tez va shoh-shohcha ishi",
    "Shunga ko'ra bahali, lekin sifati yaxshi",
    "Professionali usta, rahmat",
    "Tushunishi yaxshi, yordami ko'p",
    "Tavsiya etaman barcha do'stlariga",
]


def make_request(method: str, endpoint: str, data: Optional[Dict] = None, token: Optional[str] = None):
    """Make HTTP request to API"""
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method == "PATCH":
            response = requests.patch(url, json=data, headers=headers)
        else:
            return None

        if response.status_code >= 400:
            print(f"  ❌ {method} {endpoint}: {response.status_code} - {response.text[:100]}")
            return None

        result = response.json()
        return result.get("data") or result

    except Exception as e:
        print(f"  ❌ Request failed: {e}")
        return None


def generate_email(first_name: str, last_name: str, index: int) -> str:
    """Generate unique email"""
    return f"{first_name.lower()}.{last_name.lower()}{index}@mail.com"


def generate_phone() -> str:
    """Generate Uzbek phone number"""
    return f"+998{random.randint(88, 99)}{random.randint(100, 999)}{random.randint(1000, 9999)}"


def register_user(first_name: str, last_name: str, index: int, role: str = "customer") -> Optional[Dict]:
    """Register a new user"""
    email = generate_email(first_name, last_name, index)
    phone = generate_phone()

    payload = {
        "role": role,
        "name": f"{first_name} {last_name}",
        "phone": phone,
        "email": email,
        "password": "demo1234",
        "password_confirmation": "demo1234",
    }

    if role == "mechanic":
        payload["workshop"] = {
            "name": random.choice(SHOP_NAMES),
            "address": f"{random.randint(1, 500)} Street",
            "city": random.choice(CITIES),
            "experience": f"{random.randint(1, 15)} years",
            "services": "Engine repair, Oil change, Diagnostics",
        }

    result = make_request("POST", "/auth/register", payload)
    if result and "user" in result and "token" in result:
        return {"user": result["user"], "token": result["token"]}
    return None


def get_service_catalog() -> List[Dict]:
    """Get all available services"""
    result = make_request("GET", "/services")
    return result if isinstance(result, list) else []


def add_service_to_mechanic(service_id: int, price: int, duration: int, token: str) -> Optional[Dict]:
    """Add service to mechanic's shop"""
    payload = {
        "service_id": service_id,
        "price": price,
        "duration": f"{duration}h",
    }
    return make_request("POST", "/master/services", payload, token)


def create_vehicle(brand: str, model: str, year: int, token: str) -> Optional[Dict]:
    """Create vehicle for customer"""
    payload = {
        "brand": brand,
        "model": model,
        "year": year,
        "license_plate": f"{random.randint(100, 999)}{chr(65 + random.randint(0, 25))}{chr(65 + random.randint(0, 25))}",
    }
    return make_request("POST", "/vehicles", payload, token)


def create_booking(master_id: int, vehicle_id: int, service_ids: List[int], price: int, token: str) -> Optional[Dict]:
    """Create booking (order)"""
    payload = {
        "master_id": master_id,
        "vehicle_id": vehicle_id,
        "service_ids": service_ids,
        "price": price,
        "description": "Demo booking",
    }
    return make_request("POST", "/bookings", payload, token)


def update_booking_status(booking_id: int, status: str, token: str) -> Optional[Dict]:
    """Update booking status"""
    payload = {"status": status}
    return make_request("PATCH", f"/bookings/{booking_id}", payload, token)


def create_review(master_id: int, booking_id: int, rating: int, comment: str, token: str) -> Optional[Dict]:
    """Create review for mechanic"""
    payload = {
        "master_id": master_id,
        "booking_id": booking_id,
        "rating": rating,
        "comment": comment,
    }
    return make_request("POST", "/reviews", payload, token)


def main():
    print("\n🚀 Starting Demo Data Seeder for UstaGo Avto\n")

    users = []
    mechanics = []
    services = []

    # Step 1: Get service catalog
    print("📋 Fetching service catalog...")
    services = get_service_catalog()
    if not services:
        print("❌ No services found. Exiting.")
        return
    print(f"✅ Found {len(services)} services\n")

    # Step 2: Create 100 customer users
    print("👥 Creating 100 customer users...")
    for i in range(1, 101):
        first_name = random.choice(UZBEK_FIRST_NAMES)
        last_name = random.choice(UZBEK_LAST_NAMES)
        result = register_user(first_name, last_name, i, "customer")

        if result:
            users.append(result)
            if i % 20 == 0:
                print(f"  ✅ {i} users created")
    print(f"✅ Total customers: {len(users)}\n")

    # Step 3: Create 10 mechanics
    print("🔧 Creating 10 mechanics with services...")
    for i in range(1, 11):
        first_name = random.choice(UZBEK_FIRST_NAMES)
        last_name = random.choice(UZBEK_LAST_NAMES)
        result = register_user(first_name, last_name, i + 100, "mechanic")

        if result:
            mechanics.append(result)

            # Add 3-5 services to each mechanic
            num_services = random.randint(3, 5)
            for _ in range(num_services):
                service = random.choice(services)
                price = random.randint(50000, 500000)
                add_service_to_mechanic(service["id"], price, random.randint(1, 4), result["token"])

            print(f"  ✅ Mechanic {i} created: {result['user']['name']} with {num_services} services")

    print(f"✅ Total mechanics: {len(mechanics)}\n")

    # Step 4: Create vehicles for customers
    print("🚗 Creating vehicles for customers...")
    customer_vehicles = []
    for i in range(min(50, len(users))):
        user = users[i]
        brand = random.choice(CAR_BRANDS)
        model = random.choice(CAR_MODELS)
        year = random.randint(2010, 2024)

        vehicle = create_vehicle(brand, model, year, user["token"])
        if vehicle:
            customer_vehicles.append({"user": user, "vehicle": vehicle})

    print(f"✅ Created {len(customer_vehicles)} vehicles\n")

    # Step 5: Create bookings
    print("📅 Creating bookings...")
    booking_statuses = ["completed", "completed", "completed", "active", "rejected"]
    bookings = []

    for i in range(min(50, len(customer_vehicles))):
        user_data = customer_vehicles[i]["user"]
        vehicle = customer_vehicles[i]["vehicle"]
        mechanic = random.choice(mechanics)

        num_services = random.randint(1, 3)
        service_ids = [random.choice(services)["id"] for _ in range(num_services)]
        total_price = sum([random.randint(50000, 300000) for _ in range(num_services)])

        booking = create_booking(
            mechanic["user"]["id"],
            vehicle["id"],
            service_ids,
            total_price,
            user_data["token"]
        )

        if booking:
            status = random.choice(booking_statuses)
            bookings.append({
                "booking": booking,
                "user": user_data,
                "mechanic": mechanic,
                "status": status
            })

    print(f"✅ Created {len(bookings)} bookings\n")

    # Step 6: Update booking statuses and create reviews
    print("⭐ Updating booking statuses and creating reviews...")
    review_count = 0

    for item in bookings:
        booking = item["booking"]
        user = item["user"]
        mechanic = item["mechanic"]
        status = item["status"]

        # Update status
        update_booking_status(booking["id"], status, user["token"])

        # Create review if completed
        if status == "completed":
            rating = random.randint(3, 5)
            comment = random.choice(REVIEW_COMMENTS)
            review = create_review(
                mechanic["user"]["id"],
                booking["id"],
                rating,
                comment,
                user["token"]
            )
            if review:
                review_count += 1

    print(f"✅ {review_count} reviews created\n")

    # Summary
    print("=" * 70)
    print("✅ DEMO DATA SEEDING COMPLETE!")
    print("=" * 70)
    print(f"""
📊 SUMMARY:
  • Customers: {len(users)}
  • Mechanics: {len(mechanics)}
  • Services: {len(services)}
  • Vehicles: {len(customer_vehicles)}
  • Bookings: {len(bookings)}
  • Reviews: {review_count}

🔐 TEST CREDENTIALS (Sample):
  Customer: {users[0]['user']['email'] if users else 'N/A'} | Password: demo1234
  Mechanic: {mechanics[0]['user']['email'] if mechanics else 'N/A'} | Password: demo1234

🌐 Access at: http://localhost:8080/

📱 You can now:
   ✓ Login as customer and browse mechanics
   ✓ View mechanic profiles and ratings
   ✓ Book services and make payments
   ✓ Leave reviews and ratings
   ✓ Check notifications in real-time
   ✓ View booking history
   ✓ Mechanic can accept/reject/complete jobs
   ✓ See earnings reports
   ✓ Admin can manage all users and data

""")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Seeding interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
