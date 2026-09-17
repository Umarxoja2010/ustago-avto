/**
 * Maps backend API Resource shapes (api-types.ts) onto the frontend's
 * existing UI-shaped types (customer-data.ts / mechanic-data.ts) so the
 * existing display components (MechanicCard, booking cards, etc.) work
 * unmodified against real data.
 */

import type {
  CustomerBooking,
  MechanicProfile,
  MechanicReview,
  Vehicle,
} from "@/lib/customer-data";
import type {
  MechanicJob,
  ShopReview,
  ShopService,
  WorkingHour as ShopWorkingHour,
} from "@/lib/mechanic-data";
import type {
  ApiBooking,
  ApiMasterProfile,
  ApiMasterService,
  ApiReview,
  ApiVehicle,
  ApiWorkingHour,
} from "@/lib/api-types";
import {
  calculateDistanceKm,
  DEFAULT_TASHKENT_COORDS,
  type Coordinates,
} from "@/lib/hooks/use-user-location";

export const dicebearAvatar = (seed: string, bg = "2563EB", fg = "ffffff") =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed || "user")}&backgroundColor=${bg}&textColor=${fg}`;

const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function toUiVehicle(v: ApiVehicle): Vehicle {
  return {
    id: String(v.id),
    brand: v.brand ?? "",
    model: v.model ?? "",
    year: v.year ?? "",
    engine: v.engine ?? "",
    plate: v.plate ?? "",
    color: v.color ?? "",
  };
}

export function toUiMechanic(
  m: ApiMasterProfile,
  userCoords?: Coordinates | null | unknown,
): MechanicProfile {
  const activeServices = (m.services ?? []).filter((s) => s?.active);
  const idNum = Number(String(m.id).replace(/\D/g, "") || 1);
  const pricedServices = activeServices.filter(
    (s): s is typeof s & { price: number } => typeof s.price === "number" && s.price > 0,
  );
  const minServicePrice =
    pricedServices.length > 0 ? Math.min(...pricedServices.map((s) => s.price)) : null;
  const derivedPrice = minServicePrice ?? 80000 + ((idNum * 140000) % 1600000);

  const coords =
    userCoords && typeof userCoords === "object" && "lat" in userCoords
      ? (userCoords as Coordinates)
      : DEFAULT_TASHKENT_COORDS;

  const realDistance =
    typeof m.distanceKm === "number"
      ? m.distanceKm
      : calculateDistanceKm(coords.lat, coords.lng, m.lat, m.lng);

  return {
    id: String(m.id),
    name: m.workshopName ?? "",
    owner: m.owner ?? "",
    cover:
      m.cover ??
      "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=80",
    logo: m.logo ?? dicebearAvatar(m.workshopName ?? "Shop"),
    distanceKm: realDistance,
    rating: m.rating ?? 0,
    reviewCount: m.reviewCount ?? 0,
    open: Boolean(m.isOpen),
    startingPrice: (m as { startingPrice?: number }).startingPrice ?? derivedPrice,
    verified: m.verificationStatus === "verified",
    experienceYears: m.experienceYears ?? 0,
    address: m.address ?? "",
    district: m.district ?? "",
    phone: "",
    hours: (m.workingHours ?? [])
      .slice()
      .sort((a, b) => a.weekday - b.weekday)
      .map((h) => ({
        day: WEEKDAY_LABELS[h.weekday] ?? String(h.weekday),
        time: h.closed || !h.open || !h.close ? "Closed" : `${h.open} – ${h.close}`,
      })),
    services: activeServices.map((s) => s.name ?? "").filter(Boolean),
    vehicleTypes:
      idNum % 3 === 0
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
        : idNum % 3 === 1
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
    priceList: activeServices.map((s, idx) => ({
      label: s.name ?? "",
      price: derivedPrice + idx * 50000,
      duration: s.duration ?? "1 h",
    })),
    gallery: m.cover ? [m.cover] : [],
    reviews: [],
    lat: m.lat ?? 0,
    lng: m.lng ?? 0,
  };
}

export function toUiReview(r: ApiReview): MechanicReview {
  const author = r.customer?.name ?? "Anonymous";
  return {
    id: String(r.id),
    author,
    avatar: dicebearAvatar(String(r.id), "E2E8F0", "0f172a"),
    rating: r.rating ?? 0,
    date: formatDate(r.createdAt),
    text: r.comment ?? "",
  };
}

const STATUS_TO_STATE: Record<ApiBooking["status"], CustomerBooking["state"]> = {
  pending: "upcoming",
  accepted: "upcoming",
  completed: "completed",
  rejected: "cancelled",
  cancelled: "cancelled",
};

export function toUiBooking(b: ApiBooking): CustomerBooking {
  return {
    id: String(b.id),
    mechanicId: b.master ? String(b.master.id) : "",
    mechanic: b.master?.workshopName ?? "",
    service: b.service?.name ?? "",
    date: b.date ?? "",
    time: b.time ?? "",
    price: 0,
    state: STATUS_TO_STATE[b.status] ?? "upcoming",
    vehicle: b.vehicle?.label ?? "",
    timeline: (b.timeline ?? []).map((log) => ({
      label: log.label ?? log.status,
      time: log.happenedAt ? formatDateTime(log.happenedAt) : "",
      done: true,
    })),
  };
}

export function formatDate(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* =============================== Mechanic-side =============================== */

const MECHANIC_STATUS_TO_JOB_STATE: Record<ApiBooking["status"], MechanicJob["state"]> = {
  pending: "request",
  accepted: "active",
  completed: "completed",
  rejected: "rejected",
  cancelled: "rejected",
};

export function toMechanicJob(b: ApiBooking): MechanicJob {
  const customerName = b.customer?.name ?? "";
  return {
    id: String(b.id),
    customer: customerName,
    avatar: dicebearAvatar(customerName),
    service: b.service?.name ?? "",
    vehicle: b.vehicle?.label ?? "",
    date: b.date ?? "",
    time: b.time ?? "",
    price: 0,
    address: "",
    note: b.notes ?? undefined,
    state: MECHANIC_STATUS_TO_JOB_STATE[b.status] ?? "request",
  };
}

export function toShopService(s: ApiMasterService): ShopService {
  return {
    id: String(s.id),
    name: s.name ?? "",
    price: 0,
    duration: s.duration ?? "",
    active: Boolean(s.active),
  };
}

export function toShopWorkingHour(h: ApiWorkingHour): ShopWorkingHour {
  return {
    day: WEEKDAY_LABELS[h.weekday] ?? String(h.weekday),
    open: h.open ?? "",
    close: h.close ?? "",
    closed: Boolean(h.closed),
  };
}

export function toShopReview(r: ApiReview): ShopReview {
  const author = r.customer?.name ?? "Anonymous";
  return {
    id: String(r.id),
    author,
    avatar: dicebearAvatar(String(r.id), "E2E8F0", "0f172a"),
    rating: r.rating ?? 0,
    date: formatDate(r.createdAt),
    text: r.comment ?? "",
    service: "",
  };
}
