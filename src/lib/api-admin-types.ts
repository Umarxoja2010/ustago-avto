/**
 * Types matching the Phase 12 Admin API Resources 1:1. Separate from
 * api-types.ts since these are admin-only shapes (AdminUserResource,
 * AdminMasterResource, report payloads) distinct from what customers/
 * mechanics ever see.
 */

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "mechanic" | "admin";
  city: string | null;
  status: "active" | "suspended" | "pending";
  workshopName: string | null;
  createdAt: string;
}

export interface AdminMaster {
  id: number;
  workshopName: string;
  address: string;
  city: string;
  district: string | null;
  verificationStatus: "pending" | "verified" | "rejected" | "suspended";
  rating: number;
  reviewCount: number;
  jobsCount: number;
  isOpen: boolean;
  owner?: { id: number; name: string; phone: string; email: string; status: string };
  services: { id: number; serviceId: number; name: string | null; price: number }[];
  createdAt: string;
}

export interface AdminReportOverview {
  users: {
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
  };
  masters: {
    total: number;
    byVerificationStatus: Record<string, number>;
  };
  bookings: {
    total: number;
    byStatus: Record<string, number>;
    completedRevenue: number;
  };
  reviews: {
    total: number;
    hidden: number;
    platformAverageRating: number;
  };
}

export interface AdminSignupPoint {
  date: string;
  customer: number;
  mechanic: number;
}

export interface AdminRevenuePoint {
  date: string;
  revenue: number;
  bookingsCount: number;
}

export interface AdminTopService {
  serviceId: number;
  name: string;
  bookingsCount: number;
}
