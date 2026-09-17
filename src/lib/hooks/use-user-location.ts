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
const STORAGE_NAME_KEY = "ustago.user.location_name.v1";

export interface CoordinateHub {
  name: string;
  city: string;
  lat: number;
  lng: number;
}

export const UZBEKISTAN_COORDINATE_HUBS: CoordinateHub[] = [
  // Toshkent tumanlari
  { name: "Chilonzor tumani", city: "Toshkent", lat: 41.2721, lng: 69.2046 },
  { name: "Yunusobod tumani", city: "Toshkent", lat: 41.3644, lng: 69.2882 },
  { name: "Mirzo Ulugʻbek tumani", city: "Toshkent", lat: 41.3283, lng: 69.3346 },
  { name: "Mirobod tumani", city: "Toshkent", lat: 41.2917, lng: 69.2778 },
  { name: "Yashnobod tumani", city: "Toshkent", lat: 41.2965, lng: 69.3344 },
  { name: "Sirgʻali tumani", city: "Toshkent", lat: 41.2231, lng: 69.2201 },
  { name: "Yangihayot tumani", city: "Toshkent", lat: 41.1983, lng: 69.2084 },
  { name: "Olmazor tumani", city: "Toshkent", lat: 41.3489, lng: 69.2234 },
  { name: "Uchtepa tumani", city: "Toshkent", lat: 41.2921, lng: 69.1764 },
  { name: "Yakkasaroy tumani", city: "Toshkent", lat: 41.2825, lng: 69.2514 },
  { name: "Shayxontohur tumani", city: "Toshkent", lat: 41.3214, lng: 69.2384 },
  { name: "Bektemir tumani", city: "Toshkent", lat: 41.2381, lng: 69.3364 },

  // Toshkent viloyati shaharlari
  { name: "Chirchiq", city: "Toshkent viloyati", lat: 41.4689, lng: 69.5822 },
  { name: "Olmaliq", city: "Toshkent viloyati", lat: 40.8464, lng: 69.5986 },
  { name: "Angren", city: "Toshkent viloyati", lat: 41.0167, lng: 70.1436 },
  { name: "Nurafshon", city: "Toshkent viloyati", lat: 41.0425, lng: 69.3589 },
  { name: "Bekobod", city: "Toshkent viloyati", lat: 40.2208, lng: 69.2586 },
  { name: "Yangiyoʻl", city: "Toshkent viloyati", lat: 41.1167, lng: 69.05 },
  { name: "Qibray", city: "Toshkent viloyati", lat: 41.3897, lng: 69.4589 },
  { name: "Zangiota", city: "Toshkent viloyati", lat: 41.2167, lng: 69.1333 },

  // Viloyat markazlari
  { name: "Samarqand", city: "Samarqand", lat: 39.6542, lng: 66.9597 },
  { name: "Buxoro", city: "Buxoro", lat: 39.7747, lng: 64.4286 },
  { name: "Andijon", city: "Andijon", lat: 40.7821, lng: 72.3442 },
  { name: "Namangan", city: "Namangan", lat: 40.9983, lng: 71.6726 },
  { name: "Fargʻona", city: "Fargʻona", lat: 40.3842, lng: 71.7843 },
  { name: "Qoʻqon", city: "Fargʻona", lat: 40.5333, lng: 70.9333 },
  { name: "Margʻilon", city: "Fargʻona", lat: 40.4719, lng: 71.7125 },
  { name: "Qarshi", city: "Qashqadaryo", lat: 38.8606, lng: 65.7891 },
  { name: "Shahrisabz", city: "Qashqadaryo", lat: 39.05, lng: 66.8333 },
  { name: "Termiz", city: "Surxondaryo", lat: 37.2242, lng: 67.2783 },
  { name: "Navoiy", city: "Navoiy", lat: 40.0844, lng: 65.3792 },
  { name: "Zarafshon", city: "Navoiy", lat: 41.5722, lng: 64.1958 },
  { name: "Jizzax", city: "Jizzax", lat: 40.1158, lng: 67.8422 },
  { name: "Guliston", city: "Sirdaryo", lat: 40.4897, lng: 68.7842 },
  { name: "Urganch", city: "Xorazm", lat: 41.5504, lng: 60.6315 },
  { name: "Xiva", city: "Xorazm", lat: 41.3783, lng: 60.3639 },
  { name: "Nukus", city: "Qoraqalpogʻiston", lat: 42.4602, lng: 59.6166 },
];

/**
 * Calculates the closest known geographic district or city in Uzbekistan.
 */
export function getNearestLocationName(lat: number, lng: number): string {
  let nearest = UZBEKISTAN_COORDINATE_HUBS[0];
  let minDistance = Infinity;

  for (const point of UZBEKISTAN_COORDINATE_HUBS) {
    const dist = calculateDistanceKm(lat, lng, point.lat, point.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = point;
    }
  }

  // Inside Tashkent city perimeter
  if (nearest.city === "Toshkent" && minDistance <= 25) {
    return `Toshkent, ${nearest.name}`;
  }

  // Tashkent region cities
  if (nearest.city === "Toshkent viloyati" && minDistance <= 35) {
    return `${nearest.name} shahri`;
  }

  // Other regional centers
  if (minDistance <= 50) {
    return `${nearest.name} shahri`;
  }

  return nearest.name;
}

/**
 * Attempts online reverse geocoding via OpenStreetMap Nominatim with timeout,
 * and falls back to offline nearest-hub calculation.
 */
export async function reverseGeocodeLocation(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1&accept-language=uz,ru,en`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address;
      if (addr) {
        const district =
          addr.city_district ||
          addr.district ||
          addr.suburb ||
          addr.borough ||
          addr.neighbourhood ||
          addr.residential;
        const city = addr.city || addr.town || addr.county || addr.state;

        if (district && city && !district.toLowerCase().includes(city.toLowerCase())) {
          return `${city}, ${district}`;
        }
        if (district) return district;
        if (city) return city;
      }
    }
  } catch {
    /* fallback to offline nearest hub */
  }

  return getNearestLocationName(lat, lng);
}

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

function getStoredLocationName(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_NAME_KEY);
  } catch {
    return null;
  }
}

function setStoredLocationName(name: string) {
  try {
    window.localStorage.setItem(STORAGE_NAME_KEY, name);
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
  const [locationName, setLocationName] = useState<string>(() => {
    const stored = getStoredLocationName();
    if (stored) return stored;
    const initialCoords = getStoredLocation();
    if (initialCoords) {
      return getNearestLocationName(initialCoords.lat, initialCoords.lng);
    }
    return "Toshkent";
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

        // Instant offline resolution
        const initialName = getNearestLocationName(newCoords.lat, newCoords.lng);
        setLocationName(initialName);
        setStoredLocationName(initialName);

        // Async refined reverse geocode
        reverseGeocodeLocation(newCoords.lat, newCoords.lng).then((refinedName) => {
          if (refinedName) {
            setLocationName(refinedName);
            setStoredLocationName(refinedName);
          }
        });
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
    locationName,
    requestLocation,
  };
}
