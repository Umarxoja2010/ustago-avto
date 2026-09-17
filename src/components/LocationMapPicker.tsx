import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, ExternalLink, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Leaflet type definition for dynamically loaded Leaflet
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L?: any;
  }
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationMapPickerProps {
  value?: Coordinates | null;
  onChange?: (coords: Coordinates, addressHint?: string) => void;
  address?: string;
  onAddressChange?: (address: string) => void;
  city?: string;
  className?: string;
  inline?: boolean;
}

const CITY_PRESETS: { name: string; lat: number; lng: number }[] = [
  { name: "Toshkent shahri", lat: 41.311081, lng: 69.240562 },
  { name: "Samarqand", lat: 39.654167, lng: 66.959722 },
  { name: "Buxoro", lat: 39.774722, lng: 64.428611 },
  { name: "Andijon", lat: 40.78206, lng: 72.34424 },
  { name: "Namangan", lat: 40.9983, lng: 71.67257 },
  { name: "Fargʻona", lat: 40.38421, lng: 71.78432 },
  { name: "Qarshi", lat: 38.86056, lng: 65.78905 },
  { name: "Nukus", lat: 42.46028, lng: 59.60806 },
  { name: "Urganch", lat: 41.55, lng: 60.633333 },
  { name: "Navoiy", lat: 40.084444, lng: 65.379167 },
  { name: "Jizzax", lat: 40.115833, lng: 67.842222 },
  { name: "Guliston", lat: 40.489722, lng: 68.784167 },
  { name: "Termiz", lat: 37.22417, lng: 67.27833 },
  { name: "Chirchiq", lat: 41.468889, lng: 69.582222 },
  { name: "Angren", lat: 41.016667, lng: 70.143611 },
  { name: "Olmaliq", lat: 40.843889, lng: 69.598611 },
];

export const LocationMapPicker: React.FC<LocationMapPickerProps> = ({
  value,
  onChange,
  address = "",
  className = "",
}) => {
  const defaultCoords: Coordinates =
    value?.lat && value?.lng
      ? { lat: Number(value.lat), lng: Number(value.lng) }
      : { lat: 41.311081, lng: 69.240562 };

  const [coords, setCoords] = useState<Coordinates>(defaultCoords);
  const [addrInput, setAddrInput] = useState(address);
  const [isLocating, setIsLocating] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerInstanceRef = useRef<any>(null);

  // Sync state if external value changes
  useEffect(() => {
    if (value?.lat && value?.lng) {
      const newLat = Number(value.lat);
      const newLng = Number(value.lng);
      if (newLat !== coords.lat || newLng !== coords.lng) {
        setCoords({ lat: newLat, lng: newLng });
        if (mapInstanceRef.current && markerInstanceRef.current) {
          markerInstanceRef.current.setLatLng([newLat, newLng]);
          mapInstanceRef.current.setView([newLat, newLng], 15);
        }
      }
    }
  }, [value?.lat, value?.lng, coords.lat, coords.lng]);

  useEffect(() => {
    if (address !== addrInput) {
      setAddrInput(address);
    }
  }, [address, addrInput]);

  // Dynamically load Leaflet CSS and JS
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.L) {
      setLeafletReady(true);
      return;
    }

    // Check if script already exists
    const existingScript = document.getElementById("leaflet-js");
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (window.L) {
          setLeafletReady(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    // Add Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Add Leaflet JS
    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      setLeafletReady(true);
    };
    script.onerror = () => {
      setLoadError(true);
    };
    document.body.appendChild(script);
  }, []);

  // Update position handler
  const handlePositionChange = useCallback(
    (newLat: number, newLng: number) => {
      const roundedLat = Number(newLat.toFixed(6));
      const roundedLng = Number(newLng.toFixed(6));
      setCoords({ lat: roundedLat, lng: roundedLng });
      onChange?.({ lat: roundedLat, lng: roundedLng });
    },
    [onChange],
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || !window.L) return;

    if (!mapInstanceRef.current) {
      const L = window.L;

      // Fix default marker icon paths in Leaflet
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initialLat = coords.lat || 41.311081;
      const initialLng = coords.lng || 69.240562;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
      }).addTo(map);

      marker.bindPopup("<b>Ustaxona joylashuvi</b><br/>Belgini aniq joyga suring").openPopup();

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        handlePositionChange(pos.lat, pos.lng);
      });

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng(e.latlng);
        handlePositionChange(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      // Force size update
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, [leafletReady, handlePositionChange, coords.lat, coords.lng]);

  // Jump to specific coordinates
  const jumpTo = (newLat: number, newLng: number) => {
    const roundedLat = Number(newLat.toFixed(6));
    const roundedLng = Number(newLng.toFixed(6));
    setCoords({ lat: roundedLat, lng: roundedLng });
    handlePositionChange(roundedLat, roundedLng);

    if (mapInstanceRef.current && markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([roundedLat, roundedLng]);
      mapInstanceRef.current.setView([roundedLat, roundedLng], 15, { animate: true });
    }
  };

  // Locate current GPS position
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        jumpTo(latitude, longitude);
        toast.success("Joriy joylashuvingiz xaritada belgilandi!");
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation error:", err);
        toast.error("Joylashuvingizni aniqlab bo'lmadi. Ruxsat berilganligini tekshiring.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Toolbar: Search City Preset & GPS button */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <select
            aria-label="Hududni tezkor tanlash"
            className="w-full text-xs rounded-xl border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            onChange={(e) => {
              const selected = CITY_PRESETS.find((c) => c.name === e.target.value);
              if (selected) {
                jumpTo(selected.lat, selected.lng);
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Shahar/hududga oʻtish...
            </option>
            {CITY_PRESETS.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="rounded-xl text-xs gap-1.5 h-9 shrink-0 border-primary/30 hover:bg-primary/5 text-primary"
        >
          {isLocating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            <Navigation className="h-3.5 w-3.5 text-primary" />
          )}
          <span>{isLocating ? "Aniqlanmoqda..." : "Mening joylashuvim"}</span>
        </Button>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors py-1 px-2 rounded-lg border border-border/70"
          title="Google Xaritada ko'rish"
        >
          <span>Google Maps</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Map Display Container */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-2xl border border-border/80 bg-muted/40 shadow-inner">
        {/* Leaflet map interactive canvas */}
        {!loadError ? (
          <div ref={mapContainerRef} className="h-full w-full z-0" />
        ) : (
          /* Fallback if external Leaflet script is blocked */
          <div className="relative h-full w-full">
            <iframe
              title="Google Map Preview"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
            />
          </div>
        )}

        {/* Tip Badge */}
        <div className="pointer-events-none absolute bottom-2 left-2 z-[400] rounded-lg bg-black/75 backdrop-blur-md px-2.5 py-1 text-[11px] text-white shadow">
          📍 Xaritani bosing yoki belgini kerakli joyga suring
        </div>
      </div>

      {/* Coordinate Display & Manual Adjustment */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <Label className="text-[11px] text-muted-foreground">Kenglik (Latitude)</Label>
          <Input
            type="number"
            step="0.000001"
            value={coords.lat}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) jumpTo(val, coords.lng);
            }}
            className="h-8 rounded-lg text-xs"
          />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground">Uzunlik (Longitude)</Label>
          <Input
            type="number"
            step="0.000001"
            value={coords.lng}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) jumpTo(coords.lat, val);
            }}
            className="h-8 rounded-lg text-xs"
          />
        </div>
      </div>
    </div>
  );
};

export interface LocationPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCoords?: Coordinates | null;
  initialAddress?: string;
  onConfirm: (coords: Coordinates, address?: string) => void;
  title?: string;
  description?: string;
}

export const LocationPickerDialog: React.FC<LocationPickerDialogProps> = ({
  open,
  onOpenChange,
  initialCoords,
  initialAddress = "",
  onConfirm,
  title = "Ustaxona joylashuvini tanlang",
  description = "Xaritada ustaxonangiz joylashgan nuqtani belgilang yoki joriy joylashuvingizdan foydalaning.",
}) => {
  const [selectedCoords, setSelectedCoords] = useState<Coordinates>(
    initialCoords?.lat && initialCoords?.lng
      ? { lat: initialCoords.lat, lng: initialCoords.lng }
      : { lat: 41.311081, lng: 69.240562 },
  );
  const [addressVal, setAddressVal] = useState(initialAddress);

  useEffect(() => {
    if (open) {
      if (initialCoords?.lat && initialCoords?.lng) {
        setSelectedCoords({ lat: initialCoords.lat, lng: initialCoords.lng });
      }
      if (initialAddress) {
        setAddressVal(initialAddress);
      }
    }
  }, [open, initialCoords, initialAddress]);

  const handleSave = () => {
    onConfirm(selectedCoords, addressVal);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl p-5 max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MapPin className="h-5 w-5 text-primary shrink-0" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">{description}</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <LocationMapPicker
            value={selectedCoords}
            onChange={(c) => setSelectedCoords(c)}
            address={addressVal}
            onAddressChange={(a) => setAddressVal(a)}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Bekor qilish
          </Button>
          <Button type="button" onClick={handleSave} className="rounded-xl gap-1.5">
            <Check className="h-4 w-4" />
            <span>Joylashuvni tasdiqlash</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
