import React, { useState, useRef, useEffect } from "react";
import { UZBEKISTAN_LOCATIONS, LocationItem } from "../data/uzbekistanLocations";

export interface LocationInputProps {
  onSelect: (region: string, city: string) => void;
  defaultValue?: string;
  error?: string;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  onSelect,
  defaultValue = "",
  error,
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<LocationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (val.trim().length >= 1) {
      const cleanVal = val.toLowerCase().trim();
      const filtered = UZBEKISTAN_LOCATIONS.filter((item) =>
        item.fullName.toLowerCase().includes(cleanVal),
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (item: LocationItem) => {
    setQuery(item.fullName);
    setIsOpen(false);
    onSelect(item.region, item.city);
  };

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="block text-sm font-medium text-foreground mb-1">
        Hudud (Viloyat, shahar/tuman)
      </label>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => query.length >= 1 && setIsOpen(true)}
        placeholder="Qidiring: masalan, Toshkent yoki Samarqand..."
        className={`w-full px-3 py-2 border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm shadow-sm transition-all ${
          error ? "border-destructive" : "border-input"
        }`}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-card border border-border rounded-xl shadow-lg">
          {results.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSelect(item)}
              className="px-3 py-2.5 hover:bg-muted cursor-pointer text-sm text-foreground flex justify-between items-center border-b border-border/50 last:border-0 transition-colors"
            >
              <span>{item.fullName}</span>
              <span className="text-xs text-primary font-medium">Tanlash</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
