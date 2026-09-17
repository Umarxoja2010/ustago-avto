/**
 * Types matching the Laravel backend's API Resources 1:1 (field names as
 * the backend actually serializes them — camelCase, see each Resource's
 * toArray()). Kept separate from the frontend's existing UI-shaped types
 * (MechanicProfile, CustomerBooking, etc. in customer-data.ts /
 * mechanic-data.ts) — hooks map between the two.
 */

export interface ApiMasterService {
  id: number;
  serviceId: number;
  name: string | null;
  icon: string | null;
  duration: string | null;
  price: number | null;
  active: boolean;
}

export interface ApiWorkingHour {
  weekday: number; // 0 = Monday ... 6 = Sunday
  open: string | null;
  close: string | null;
  closed: boolean;
}

export interface ApiMasterProfile {
  id: number;
  workshopName: string;
  owner: string | null;
  about: string | null;
  cover: string | null;
  logo: string | null;
  address: string;
  district: string | null;
  city: string;
  lat: number | null;
  lng: number | null;
  distanceKm?: number | null;
  experienceYears: number;
  verificationStatus: "pending" | "verified" | "rejected" | "suspended";
  rating: number;
  reviewCount: number;
  jobsCount: number;
  isOpen: boolean;
  services: ApiMasterService[];
  workingHours: ApiWorkingHour[];
}

export interface ApiVehicle {
  id: number;
  brand: string;
  model: string;
  year: string | null;
  engine: string | null;
  plate: string | null;
  color: string | null;
}

export interface ApiBookingStatusLog {
  status: string;
  label: string | null;
  happenedAt: string | null;
}

export type ApiBookingStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";

export interface ApiBooking {
  id: number;
  status: ApiBookingStatus;
  date: string | null;
  time: string;
  notes: string | null;
  price?: number;
  customer?: { id: number; name: string; phone: string };
  master?: { id: number; workshopName: string; phone: string | null; address: string };
  service?: { id: number; name: string | null };
  vehicle?: { id: number; label: string } | null;
  hasReview?: boolean;
  timeline: ApiBookingStatusLog[];
  createdAt: string;
}

export interface ApiReview {
  id: number;
  bookingId: number;
  rating: number;
  comment: string | null;
  hidden: boolean;
  customer?: { id: number; name: string };
  master?: { id: number; workshopName: string };
  createdAt: string;
}

export interface ApiNotification {
  id: number;
  title: string;
  body: string;
  kind: string;
  audience: "all" | "customers" | "mechanics" | null;
  unread: boolean;
  createdAt: string;
}

export interface ApiService {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
}

export interface ApiSpecialOffer {
  id: number;
  title: string;
  subtitle: string | null;
  cta: string | null;
  image: string;
  link: string | null;
  badge: string | null;
  accent: string | null;
  isActive: boolean;
  sortOrder: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string | null;
}
