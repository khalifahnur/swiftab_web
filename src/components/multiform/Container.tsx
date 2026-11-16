"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Check, Loader2, Store } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Chip, Field, SectionLabel, inputClass, textareaClass } from "@/components/ui/field";
import { ChipPicker } from "@/components/restaurant/ChipPicker";
import { ImageDrop } from "@/components/restaurant/ImageDrop";
import { LocationPicker, validCoordinates } from "@/components/restaurant/LocationPicker";
import { OpeningHoursEditor } from "@/components/restaurant/OpeningHoursEditor";
import { useAuth } from "@/components/auth/AuthContext";
import { createRestaurant } from "@/lib/api";
import { errorMessage } from "@/lib/axios";
import { formatKes } from "@/lib/format";
import { AMENITY_OPTIONS, CUISINE_OPTIONS, PAYMENT_OPTIONS, defaultOpeningHours, openingHoursError } from "@/lib/restaurant";
import { cn } from "@/lib/utils";
import type { OpeningHour } from "@/types/api";

interface RestaurantSetupModalProps {
  isOpen: boolean;
}

interface SetupValues {
  restaurantName: string;
  description: string;
  phone: string;
  email: string;
  cuisines: string[];
  amenities: string[];
  averagePrice: string;
  openingHours: OpeningHour[];
  paymentMethods: string[];
  taxRate: string;
  serviceCharge: string;
  location: string;
  latitude: string;
  longitude: string;
  cover: File | null;
  logo: File | null;
}

type Errors = Partial<Record<keyof SetupValues, string>>;

const STEPS = ["Basics", "Menu & price", "Hours", "Payments", "Location", "Photos"] as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9][0-9\s-]{7,16}$/;

function percent(value: string): number | null {
  if (value.trim() === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
}

/** Checks one step and returns what is wrong with it, keyed by field. */
function validateStep(step: number, v: SetupValues): Errors {
  const errors: Errors = {};
  switch (step) {
    case 0:
      if (v.restaurantName.trim().length < 2) errors.restaurantName = "Enter your restaurant's name.";
      if (v.description.trim().length < 20) errors.description = "Describe your restaurant in a sentence or two (at least 20 characters).";
      if (!PHONE.test(v.phone.trim())) errors.phone = "Enter a phone number guests can call, for example +254 712 345678.";
      if (!EMAIL.test(v.email.trim())) errors.email = "Enter a valid email address.";
      break;
    case 1:
      if (v.cuisines.length === 0) errors.cuisines = "Choose at least one cuisine.";
      if (!(Number(v.averagePrice) > 0)) errors.averagePrice = "Enter what a typical meal costs per person.";
      break;
    case 2: {
      const problem = openingHoursError(v.openingHours);
      if (problem) errors.openingHours = problem;
      break;
    }
    case 3:
      if (v.paymentMethods.length === 0) errors.paymentMethods = "Choose at least one way guests can pay.";
      if (percent(v.taxRate) === null) errors.taxRate = "Enter a percentage from 0 to 100.";
      if (percent(v.serviceCharge) === null) errors.serviceCharge = "Enter a percentage from 0 to 100.";
      break;
    case 4:
      if (v.location.trim().length < 3) errors.location = "Enter your restaurant's address.";
      if (!validCoordinates(v.latitude, v.longitude)) {
        errors.latitude = "Set the map position: use your current location or enter the coordinates.";
      }
      break;
    case 5:
      if (!v.cover) errors.cover = "Add a cover photo. It is the first thing guests see.";
      break;
  }
  return errors;
}

export function RestaurantSetupModal({ isOpen }: RestaurantSetupModalProps) {
  const { user, refreshUser, signOut } = useAuth();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<SetupValues>({
    restaurantName: "",
    description: "",
    phone: user?.phoneNumber ?? "",
    email: user?.email ?? "",
    cuisines: [],
    amenities: [],
    averagePrice: "",
    openingHours: defaultOpeningHours(),
    paymentMethods: ["M-Pesa", "Cash"],
    taxRate: "16",
    serviceCharge: "0",
    location: "",
    latitude: "",
    longitude: "",
    cover: null,
    logo: null,
  });

  const set = <K extends keyof SetupValues>(key: K, value: SetupValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Editing a field clears its complaint; it is checked again on Continue.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const goNext = () => {
    const problems = validateStep(step, values);
    setErrors(problems);
    if (Object.keys(problems).length === 0) setStep((s) => s + 1);
  };

  const submit = async () => {
    // Check every step again: this is the last chance before saving.
    for (let i = 0; i < STEPS.length; i++) {
      const problems = validateStep(i, values);
      if (Object.keys(problems).length > 0) {
        setErrors(problems);
        setStep(i);
        return;
      }
    }

    setSubmitting(true);
    try {
      await createRestaurant(
        {
          restaurantName: values.restaurantName.trim(),
          description: values.description.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          cuisines: values.cuisines,
          amenities: values.amenities,
          averagePrice: Number(values.averagePrice),
          openingHours: values.openingHours,
          paymentMethods: values.paymentMethods,
          // Stored as fractions: 16% is 0.16.
          taxRate: (percent(values.taxRate) ?? 0) / 100,
          serviceCharge: (percent(values.serviceCharge) ?? 0) / 100,
          location: values.location.trim(),
          latitude: Number(values.latitude),
          longitude: Number(values.longitude),
        },
        { cover: values.cover!, logo: values.logo },
      );
      toast.success("Your restaurant is set up. Welcome to Swiftab.");
      await refreshUser();
    } catch (error) {
      toast.error(errorMessage(error, "We couldn't save your restaurant. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const isLast = step === STEPS.length - 1;

  return (
    // The wizard cannot be dismissed: the dashboard has nothing to show until
    // the restaurant exists.
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[92vh] w-full flex-col gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-2xl sm:max-w-2xl"
      >
        <div className="shrink-0 border-b border-gray-100 px-6 pb-5 pt-6 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal/10 text-teal">
              <Store className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold text-gray-900">Set up your restaurant</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Step {step + 1} of {STEPS.length} · {STEPS[step]}
              </DialogDescription>
            </div>
          </div>

          <ol className="mt-5 flex gap-1.5" aria-label="Setup progress">
            {STEPS.map((name, index) => (
              <li key={name} className="flex-1">
                <button
                  type="button"
                  // Earlier steps can be revisited; later ones need Continue.
                  disabled={index >= step}
                  onClick={() => setStep(index)}
                  aria-label={`${name}${index < step ? ", completed" : index === step ? ", current step" : ""}`}
                  className={cn(
                    "block h-1.5 w-full rounded-full transition-colors",
                    index < step ? "cursor-pointer bg-teal hover:bg-teal-deep" : index === step ? "bg-teal/50" : "bg-gray-100",
                  )}
                />
              </li>
            ))}
          </ol>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {step === 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Restaurant name" htmlFor="restaurantName" error={errors.restaurantName} className="sm:col-span-2">
                <input
                  id="restaurantName"
                  autoFocus
                  value={values.restaurantName}
                  onChange={(e) => set("restaurantName", e.target.value)}
                  aria-invalid={Boolean(errors.restaurantName)}
                  placeholder="Baraka Bistro"
                  className={inputClass}
                />
              </Field>
              <Field
                label="About"
                htmlFor="description"
                error={errors.description}
                hint="Shown on your page in the guest app."
                className="sm:col-span-2"
              >
                <textarea
                  id="description"
                  value={values.description}
                  onChange={(e) => set("description", e.target.value)}
                  aria-invalid={Boolean(errors.description)}
                  maxLength={600}
                  placeholder="What you cook, the atmosphere, what you're known for."
                  className={textareaClass}
                />
              </Field>
              <Field label="Phone" htmlFor="phone" error={errors.phone}>
                <input
                  id="phone"
                  type="tel"
                  value={values.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  aria-invalid={Boolean(errors.phone)}
                  placeholder="+254 712 345678"
                  autoComplete="tel"
                  className={inputClass}
                />
              </Field>
              <Field label="Email" htmlFor="email" error={errors.email}>
                <input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  placeholder="hello@restaurant.co.ke"
                  autoComplete="email"
                  className={inputClass}
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-7">
              <div>
                <SectionLabel className="mb-3">Cuisine</SectionLabel>
                <ChipPicker
                  options={CUISINE_OPTIONS}
                  value={values.cuisines}
                  onChange={(v) => set("cuisines", v)}
                  allowCustom
                  customPlaceholder="Add a cuisine"
                  max={8}
                />
                {errors.cuisines && (
                  <p role="alert" className="mt-2 text-xs font-medium text-rose-600">
                    {errors.cuisines}
                  </p>
                )}
              </div>

              <Field
                label="Average price per person"
                htmlFor="averagePrice"
                error={errors.averagePrice}
                hint="Helps guests know what to expect before they book."
                className="max-w-xs"
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">KES</span>
                  <input
                    id="averagePrice"
                    inputMode="numeric"
                    value={values.averagePrice}
                    onChange={(e) => set("averagePrice", e.target.value.replace(/[^\d.]/g, ""))}
                    aria-invalid={Boolean(errors.averagePrice)}
                    placeholder="1500"
                    className={cn(inputClass, "pl-12")}
                  />
                </div>
              </Field>

              <div>
                <SectionLabel className="mb-1">Amenities</SectionLabel>
                <p className="mb-3 text-xs text-gray-500">Optional. Pick what applies.</p>
                <ChipPicker options={AMENITY_OPTIONS} value={values.amenities} onChange={(v) => set("amenities", v)} max={20} />
              </div>
            </div>
          )}

          {step === 2 && (
            <OpeningHoursEditor value={values.openingHours} onChange={(v) => set("openingHours", v)} error={errors.openingHours} />
          )}

          {step === 3 && (
            <div className="space-y-7">
              <div>
                <SectionLabel className="mb-3">Accepted payments</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_OPTIONS.map((method) => {
                    const selected = values.paymentMethods.includes(method);
                    return (
                      <Chip
                        key={method}
                        selected={selected}
                        onClick={() =>
                          set("paymentMethods", selected ? values.paymentMethods.filter((m) => m !== method) : [...values.paymentMethods, method])
                        }
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
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="VAT / tax" htmlFor="taxRate" error={errors.taxRate} hint="Shown on receipts. Kenya's standard VAT is 16%.">
                  <div className="relative">
                    <input
                      id="taxRate"
                      inputMode="decimal"
                      value={values.taxRate}
                      onChange={(e) => set("taxRate", e.target.value.replace(/[^\d.]/g, ""))}
                      aria-invalid={Boolean(errors.taxRate)}
                      className={cn(inputClass, "pr-9")}
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">%</span>
                  </div>
                </Field>
                <Field label="Service charge" htmlFor="serviceCharge" error={errors.serviceCharge} hint="Leave at 0 if you don't add one.">
                  <div className="relative">
                    <input
                      id="serviceCharge"
                      inputMode="decimal"
                      value={values.serviceCharge}
                      onChange={(e) => set("serviceCharge", e.target.value.replace(/[^\d.]/g, ""))}
                      aria-invalid={Boolean(errors.serviceCharge)}
                      className={cn(inputClass, "pr-9")}
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">%</span>
                  </div>
                </Field>
              </div>
            </div>
          )}

          {step === 4 && (
            <LocationPicker
              value={{ location: values.location, latitude: values.latitude, longitude: values.longitude }}
              onChange={(next) => {
                setValues((prev) => ({ ...prev, ...next }));
                setErrors((prev) => ({ ...prev, location: undefined, latitude: undefined, longitude: undefined }));
              }}
              errors={{ location: errors.location, latitude: errors.latitude, longitude: errors.longitude }}
            />
          )}

          {step === 5 && (
            <div className="space-y-7">
              <div>
                <SectionLabel className="mb-3">Cover photo</SectionLabel>
                <ImageDrop
                  file={values.cover}
                  onChange={(file) => set("cover", file)}
                  label="Add a cover photo"
                  hint="A wide photo of your space or a signature dish works best."
                  error={errors.cover}
                />
              </div>
              <div className="flex flex-wrap items-start gap-5">
                <div>
                  <SectionLabel className="mb-3">Logo</SectionLabel>
                  <ImageDrop file={values.logo} onChange={(file) => set("logo", file)} label="Add logo" shape="square" />
                </div>
                <p className="max-w-xs pt-8 text-xs leading-relaxed text-gray-500">
                  Optional. A square image looks best. You can add or change it later in Settings.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
                <SectionLabel className="mb-3">Check before you finish</SectionLabel>
                <dl className="grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
                  <Summary term="Name" value={values.restaurantName} />
                  <Summary term="Cuisine" value={values.cuisines.join(", ")} />
                  <Summary term="Average price" value={formatKes(Number(values.averagePrice))} />
                  <Summary term="Open" value={`${values.openingHours.filter((h) => h.open).length} days a week`} />
                  <Summary term="Payments" value={values.paymentMethods.join(", ")} />
                  <Summary term="Address" value={values.location} />
                </dl>
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-4 sm:px-8">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setStep((s) => s - 1);
              }}
              disabled={submitting}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <button type="button" onClick={() => signOut()} className="text-sm font-medium text-gray-500 underline-offset-4 hover:text-gray-700 hover:underline">
              Sign out
            </button>
          )}

          {isLast ? (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="inline-flex h-11 min-w-40 items-center justify-center gap-2 rounded-xl bg-teal px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-deep disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Finish setup
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-deep"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Summary({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex min-w-0 justify-between gap-3 sm:block">
      <dt className="shrink-0 text-xs text-gray-500">{term}</dt>
      <dd className="truncate font-medium text-gray-900">{value || "—"}</dd>
    </div>
  );
}
