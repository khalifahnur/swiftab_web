"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Chip, Field, inputClass, textareaClass } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { ChipPicker } from "@/components/restaurant/ChipPicker";
import { ImageDrop } from "@/components/restaurant/ImageDrop";
import { LocationPicker, validCoordinates } from "@/components/restaurant/LocationPicker";
import { OpeningHoursEditor } from "@/components/restaurant/OpeningHoursEditor";
import { useAuth } from "@/components/auth/AuthContext";
import { useUpdateRestaurant } from "@/hooks/queries";
import { AMENITY_OPTIONS, CUISINE_OPTIONS, PAYMENT_OPTIONS, completeOpeningHours, openingHoursError } from "@/lib/restaurant";
import { cn } from "@/lib/utils";
import type { AdminInfo, OpeningHour, RestaurantInput } from "@/types/api";
import { Card } from "./Card";

interface Values {
  restaurantName: string;
  description: string;
  phone: string;
  email: string;
  averagePrice: string;
  cuisines: string[];
  amenities: string[];
  location: string;
  latitude: string;
  longitude: string;
  openingHours: OpeningHour[];
  paymentMethods: string[];
  taxRate: string;
  serviceCharge: string;
  acceptingReservations: boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A stored rate (0.16) as the percentage a person types (16). */
const toPercent = (rate?: number) => String(Math.round((rate ?? 0) * 10000) / 100);

function fromServer(user: AdminInfo): Values {
  return {
    restaurantName: user.restaurantName ?? "",
    description: user.description ?? "",
    phone: user.phone ?? "",
    email: user.restaurantEmail ?? "",
    averagePrice: user.averagePrice ? String(user.averagePrice) : "",
    cuisines: user.cuisines ?? [],
    amenities: user.amenities ?? [],
    location: user.location ?? "",
    latitude: user.latitude ? String(user.latitude) : "",
    longitude: user.longitude ? String(user.longitude) : "",
    openingHours: completeOpeningHours(user.openingHours),
    paymentMethods: user.paymentMethods ?? [],
    taxRate: toPercent(user.taxRate),
    serviceCharge: toPercent(user.serviceCharge),
    acceptingReservations: user.acceptingReservations !== false,
  };
}

type Errors = Partial<Record<keyof Values, string>>;

function validate(v: Values): Errors {
  const errors: Errors = {};
  if (v.restaurantName.trim().length < 2) errors.restaurantName = "Enter your restaurant's name.";
  if (v.email.trim() && !EMAIL.test(v.email.trim())) errors.email = "Enter a valid email address.";
  if (v.averagePrice.trim() && !(Number(v.averagePrice) >= 0)) errors.averagePrice = "Enter an amount in shillings.";
  if (v.location.trim().length < 3) errors.location = "Enter your restaurant's address.";
  if (!validCoordinates(v.latitude, v.longitude)) errors.latitude = "Set the map position so guests can find you.";
  const hours = openingHoursError(v.openingHours);
  if (hours) errors.openingHours = hours;
  if (v.paymentMethods.length === 0) errors.paymentMethods = "Choose at least one way guests can pay.";
  for (const key of ["taxRate", "serviceCharge"] as const) {
    const n = Number(v[key] || 0);
    if (!Number.isFinite(n) || n < 0 || n > 100) errors[key] = "Enter a percentage from 0 to 100.";
  }
  return errors;
}

/** Restaurant profile, opening hours and payment settings, saved together. */
export function RestaurantSettings() {
  const { user } = useAuth();
  if (!user) return null;
  const initial = fromServer(user);
  // Keyed on the saved values: once a save lands, the form starts again from
  // what the server now holds.
  return <RestaurantForm key={JSON.stringify(initial) + (user.image ?? "") + (user.logo ?? "")} user={user} initial={initial} />;
}

function RestaurantForm({ user, initial }: { user: AdminInfo; initial: Values }) {
  const update = useUpdateRestaurant();
  const [values, setValues] = useState<Values>(initial);
  const [cover, setCover] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  const dirty = JSON.stringify(values) !== JSON.stringify(initial) || cover !== null || logo !== null;

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const save = () => {
    const problems = validate(values);
    setErrors(problems);
    const first = Object.keys(problems)[0];
    if (first) {
      document.getElementById(`section-${sectionOf(first as keyof Values)}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const input: RestaurantInput = {
      restaurantName: values.restaurantName.trim(),
      description: values.description.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      averagePrice: Number(values.averagePrice || 0),
      cuisines: values.cuisines,
      amenities: values.amenities,
      location: values.location.trim(),
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
      openingHours: values.openingHours,
      paymentMethods: values.paymentMethods,
      taxRate: Number(values.taxRate || 0) / 100,
      serviceCharge: Number(values.serviceCharge || 0) / 100,
      acceptingReservations: values.acceptingReservations,
    };

    update.mutate([input, { cover, logo }], {
      onSuccess: () => {
        setCover(null);
        setLogo(null);
      },
    });
  };

  const discard = () => {
    setValues(initial);
    setCover(null);
    setLogo(null);
    setErrors({});
  };

  return (
    <div className="space-y-5 pb-24">
      <Card id="section-profile" title="Profile" description="What guests see on your page in the Swiftab app.">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-2 text-[13px] font-medium text-gray-700">Cover photo</p>
            <ImageDrop file={cover} onChange={setCover} currentUrl={user.image} label="Add a cover photo" />
          </div>
          <div>
            <p className="mb-2 text-[13px] font-medium text-gray-700">Logo</p>
            <ImageDrop file={logo} onChange={setLogo} currentUrl={user.logo} label="Add logo" shape="square" />
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Restaurant name" htmlFor="set-name" error={errors.restaurantName}>
            <input id="set-name" value={values.restaurantName} onChange={(e) => set("restaurantName", e.target.value)} aria-invalid={Boolean(errors.restaurantName)} className={inputClass} />
          </Field>
          <Field label="Average price per person" htmlFor="set-price" error={errors.averagePrice}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">KES</span>
              <input
                id="set-price"
                inputMode="numeric"
                value={values.averagePrice}
                onChange={(e) => set("averagePrice", e.target.value.replace(/[^\d.]/g, ""))}
                aria-invalid={Boolean(errors.averagePrice)}
                className={cn(inputClass, "pl-12")}
              />
            </div>
          </Field>
          <Field label="About" htmlFor="set-about" className="sm:col-span-2">
            <textarea id="set-about" value={values.description} maxLength={600} onChange={(e) => set("description", e.target.value)} className={textareaClass} />
          </Field>
          <Field label="Phone" htmlFor="set-phone">
            <input id="set-phone" type="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Email" htmlFor="set-email" error={errors.email}>
            <input id="set-email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} aria-invalid={Boolean(errors.email)} className={inputClass} />
          </Field>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <p className="mb-2 text-[13px] font-medium text-gray-700">Cuisine</p>
            <ChipPicker options={CUISINE_OPTIONS} value={values.cuisines} onChange={(v) => set("cuisines", v)} allowCustom customPlaceholder="Add a cuisine" max={8} />
          </div>
          <div>
            <p className="mb-2 text-[13px] font-medium text-gray-700">Amenities</p>
            <ChipPicker options={AMENITY_OPTIONS} value={values.amenities} onChange={(v) => set("amenities", v)} max={20} />
          </div>
        </div>
      </Card>

      <Card id="section-location" title="Location" description="Where guests are sent for directions.">
        <LocationPicker
          value={{ location: values.location, latitude: values.latitude, longitude: values.longitude }}
          onChange={(next) => {
            setValues((prev) => ({ ...prev, ...next }));
            setErrors((prev) => ({ ...prev, location: undefined, latitude: undefined }));
          }}
          errors={{ location: errors.location, latitude: errors.latitude }}
        />
      </Card>

      <Card id="section-reservations" title="Reservations">
        <label className="flex cursor-pointer items-center justify-between gap-6">
          <span>
            <span className="block text-sm font-medium text-gray-900">Accept new reservations</span>
            <span className="block text-[13px] text-gray-500">
              Switch off to pause bookings from the guest app, for example for a private event. Existing reservations are kept.
            </span>
          </span>
          <Switch checked={values.acceptingReservations} onCheckedChange={(v) => set("acceptingReservations", v)} aria-label="Accept new reservations" />
        </label>
      </Card>

      <Card id="section-hours" title="Opening hours" description="Shown to guests and used for the open or closed badge.">
        <OpeningHoursEditor value={values.openingHours} onChange={(v) => set("openingHours", v)} error={errors.openingHours} />
      </Card>

      <Card id="section-payments" title="Payments and tax" description="The ways guests can settle a bill, and what your receipts show.">
        <p className="mb-2 text-[13px] font-medium text-gray-700">Accepted payments</p>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_OPTIONS.map((method) => {
            const selected = values.paymentMethods.includes(method);
            return (
              <Chip
                key={method}
                selected={selected}
                onClick={() => set("paymentMethods", selected ? values.paymentMethods.filter((m) => m !== method) : [...values.paymentMethods, method])}
              >
                {selected && <Check className="h-3.5 w-3.5" />}
                {method}
              </Chip>
            );
          })}
        </div>
        {errors.paymentMethods && (
          <p role="alert" className="mt-2 text-xs font-medium text-rose-600">
            {errors.paymentMethods}
          </p>
        )}

        <div className="mt-6 grid max-w-md gap-5 sm:grid-cols-2">
          <Field label="VAT / tax" htmlFor="set-tax" error={errors.taxRate} hint="Receipts show this share of each bill as VAT.">
            <div className="relative">
              <input id="set-tax" inputMode="decimal" value={values.taxRate} onChange={(e) => set("taxRate", e.target.value.replace(/[^\d.]/g, ""))} aria-invalid={Boolean(errors.taxRate)} className={cn(inputClass, "pr-9")} />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">%</span>
            </div>
          </Field>
          <Field label="Service charge" htmlFor="set-service" error={errors.serviceCharge} hint="Shown to guests on your page.">
            <div className="relative">
              <input id="set-service" inputMode="decimal" value={values.serviceCharge} onChange={(e) => set("serviceCharge", e.target.value.replace(/[^\d.]/g, ""))} aria-invalid={Boolean(errors.serviceCharge)} className={cn(inputClass, "pr-9")} />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">%</span>
            </div>
          </Field>
        </div>
      </Card>

      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur md:left-[var(--sidebar-width,16rem)]">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-700">You have unsaved changes.</p>
            <div className="flex gap-2">
              <button type="button" onClick={discard} disabled={update.isPending} className="h-10 rounded-xl px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50">
                Discard
              </button>
              <button
                type="button"
                onClick={save}
                disabled={update.isPending}
                className="inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-xl bg-teal px-5 text-sm font-semibold text-white transition hover:bg-teal-deep disabled:opacity-60"
              >
                {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function sectionOf(field: keyof Values): string {
  if (field === "location" || field === "latitude" || field === "longitude") return "location";
  if (field === "openingHours") return "hours";
  if (field === "paymentMethods" || field === "taxRate" || field === "serviceCharge") return "payments";
  return "profile";
}
