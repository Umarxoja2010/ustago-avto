import { useCallback, useEffect, useState } from "react";

export interface Coordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

export type GeolocationStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";

export const DEFAULT_TASHKENT_COORDS: Coordinates = {
  lat: 41.311081,
  lng: 69.240562,
};

const STORAGE_KEY = "ustago.user.location.v1";

/**
 * Calculates real-world distance between two GPS coordinates using the Haversine formula (in km).
 */
export function calculateDistanceKm(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null,
): number {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null ||
    (lat1 === 0 && lon1 === 0) ||
    (lat2 === 0 && lon2 === 0)
  ) {
    return 0;
  }

  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 10) / 10;
}

function getStoredLocation(): Coordinates | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number") {
      return parsed;
    }
  } catch {
    /* ignore storage errors */
  }
  return null;
}

function setStoredLocation(coords: Coordinates) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
  } catch {
    /* ignore */
  }
}

export function useUserLocation() {
  const [coords, setCoords] = useState<Coordinates>(() => {
    return getStoredLocation() ?? DEFAULT_TASHKENT_COORDS;
  });
  const [isRealGps, setIsRealGps] = useState<boolean>(() => {
    return getStoredLocation() !== null;
  });
  const [status, setStatus] = useState<GeolocationStatus>("idle");

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator?.geolocation) {
      setStatus("unavailable");
      return;
    }

    setStatus("requesting");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setCoords(newCoords);
        setIsRealGps(true);
        setStatus("granted");
        setStoredLocation(newCoords);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
        } else {
          setStatus("unavailable");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 120000, // cache for 2 minutes
      },
    );
  }, []);

  // Request location on mount if not previously denied
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    coords,
    isRealGps,
    status,
    requestLocation,
  };
}
