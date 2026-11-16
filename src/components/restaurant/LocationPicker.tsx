"use client";

import { useState } from "react";
import { Crosshair, Loader2, MapPin } from "lucide-react";
import { Field, inputClass } from "@/components/ui/field";

export interface LocationValue {
  location: string;
  latitude: string;
  longitude: string;
}

interface Props {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  errors?: Partial<Record<keyof LocationValue, string>>;
}

interface Suggestion {
  label: string;
  latitude: number;
  longitude: number;
}

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/** True when both coordinates are real numbers inside the valid range. */
export function validCoordinates(latitude: string, longitude: string): boolean {
  const lat = Number(latitude);
  const lng = Number(longitude);
  return (
    latitude.trim() !== "" &&
    longitude.trim() !== "" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

/**
 * Address plus map position. The position can come from the device's
 * location, from an address search (when a Google Maps key is configured) or
 * be typed in; the map preview shows where diners will be sent.
 */
export function LocationPicker({ value, onChange, errors }: Props) {
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const useDeviceLocation = () => {
    if (!navigator.geolocation) {
      setNotice("This browser can't share its location. Enter the coordinates instead.");
      return;
    }
    setLocating(true);
    setNotice(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        onChange({
          ...value,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        });
      },
      () => {
        setLocating(false);
        setNotice("We couldn't read your location. Allow location access, or enter the coordinates instead.");
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const search = async () => {
    if (!GOOGLE_KEY || value.location.trim().length < 4) return;
    setSearching(true);
    setNotice(null);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(value.location)}&key=${GOOGLE_KEY}`,
      );
      const data = await response.json();
      const found: Suggestion[] = (data.results ?? []).slice(0, 5).map((r: any) => ({
        label: r.formatted_address,
        latitude: r.geometry.location.lat,
        longitude: r.geometry.location.lng,
      }));
      setSuggestions(found);
      if (found.length === 0) setNotice("No match for that address. Try adding the town or street.");
    } catch {
      setNotice("Address search isn't available right now. Enter the coordinates instead.");
    } finally {
      setSearching(false);
    }
  };

  const hasPin = validCoordinates(value.latitude, value.longitude);
  const lat = Number(value.latitude);
  const lng = Number(value.longitude);
  const span = 0.006;

  return (
    <div className="space-y-5">
      <Field label="Address" htmlFor="location" error={errors?.location} hint="What guests should type into a taxi app to find you.">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="location"
              value={value.location}
              onChange={(e) => {
                setSuggestions([]);
                onChange({ ...value, location: e.target.value });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && GOOGLE_KEY) {
                  e.preventDefault();
                  search();
                }
              }}
              aria-invalid={Boolean(errors?.location)}
              placeholder="Kimathi Street, Nairobi"
              autoComplete="street-address"
              className={`${inputClass} pl-9`}
            />
          </div>
          {GOOGLE_KEY && (
            <button
              type="button"
              onClick={search}
              disabled={searching || value.location.trim().length < 4}
              className="inline-flex h-11 shrink-0 items-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find on map"}
            </button>
          )}
        </div>
      </Field>

      {suggestions.length > 0 && (
        <ul className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {suggestions.map((s) => (
            <li key={`${s.latitude},${s.longitude}`} className="border-b border-gray-100 last:border-0">
              <button
                type="button"
                onClick={() => {
                  setSuggestions([]);
                  onChange({ location: s.label, latitude: s.latitude.toFixed(6), longitude: s.longitude.toFixed(6) });
                }}
                className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[13px] font-medium text-gray-700">Map position</p>
            <p className="text-xs text-gray-500">Used for directions and "near me" in the guest app.</p>
          </div>
          <button
            type="button"
            onClick={useDeviceLocation}
            disabled={locating}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-[13px] font-semibold text-teal shadow-sm ring-1 ring-gray-200 transition hover:bg-teal/5 disabled:opacity-60"
          >
            {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}
            Use my current location
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude" htmlFor="latitude" error={errors?.latitude}>
            <input
              id="latitude"
              inputMode="decimal"
              value={value.latitude}
              onChange={(e) => onChange({ ...value, latitude: e.target.value })}
              aria-invalid={Boolean(errors?.latitude)}
              placeholder="-1.286389"
              className={inputClass}
            />
          </Field>
          <Field label="Longitude" htmlFor="longitude" error={errors?.longitude}>
            <input
              id="longitude"
              inputMode="decimal"
              value={value.longitude}
              onChange={(e) => onChange({ ...value, longitude: e.target.value })}
              aria-invalid={Boolean(errors?.longitude)}
              placeholder="36.817223"
              className={inputClass}
            />
          </Field>
        </div>

        {notice && <p className="mt-3 text-xs font-medium text-amber-700">{notice}</p>}

        {hasPin && (
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <iframe
              title="Map preview of the restaurant's position"
              className="h-44 w-full"
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - span}%2C${lat - span}%2C${lng + span}%2C${lat + span}&layer=mapnik&marker=${lat}%2C${lng}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
