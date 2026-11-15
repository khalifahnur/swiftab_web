"use client";

import { useEffect, useState } from "react";
import { CalendarRange, Loader2, Megaphone, Pencil, Plus, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, inputClass, textareaClass } from "@/components/ui/field";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { ImageDrop } from "@/components/restaurant/ImageDrop";
import { useCreatePromotion, useDeletePromotion, usePromotions, useUpdatePromotion } from "@/hooks/queries";
import { PAYMENT_METHODS, formatDate, paymentMeta } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Promotion, PromotionInput, PromotionType } from "@/types/api";
import { Card } from "./Card";

const TYPES: { key: PromotionType; label: string; hint: string }[] = [
  { key: "DISCOUNT", label: "Discount", hint: "A percentage off" },
  { key: "PAYMENT_OFFER", label: "Payment offer", hint: "A perk for paying a certain way" },
  { key: "SPECIAL", label: "Special", hint: "A dish or event to feature" },
  { key: "SEASONAL", label: "Seasonal", hint: "Tied to a holiday or season" },
];

const day = (value: string | Date) => new Date(value).toISOString().slice(0, 10);
const today = () => day(new Date());
const inDays = (n: number) => day(new Date(Date.now() + n * 86_400_000));

/** Where a promotion stands today. */
function phase(p: Promotion): { label: string; badge: string } {
  const now = Date.now();
  if (!p.isActive) return { label: "Paused", badge: "bg-gray-100 text-gray-600 ring-gray-500/10" };
  if (new Date(p.endDate).getTime() < now) return { label: "Ended", badge: "bg-gray-100 text-gray-600 ring-gray-500/10" };
  if (new Date(p.startDate).getTime() > now) return { label: "Scheduled", badge: "bg-sky-50 text-sky-700 ring-sky-600/20" };
  return { label: "Running", badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" };
}

/** Offers shown to diners in the guest app. */
export function PromotionSettings() {
  const { data, isPending, isError, refetch } = usePromotions();
  const update = useUpdatePromotion();
  const remove = useDeletePromotion();
  const [form, setForm] = useState<{ promotion?: Promotion } | null>(null);
  const [toDelete, setToDelete] = useState<Promotion | null>(null);

  const promotions = data ?? [];

  return (
    <>
      <Card
        title="Promotions"
        description="Offers appear on the home screen of the guest app while they are running."
        action={
          <button
            type="button"
            onClick={() => setForm({})}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white transition hover:bg-teal-deep"
          >
            <Plus className="h-4 w-4" /> New promotion
          </button>
        }
      >
        {isError ? (
          <div role="alert" className="py-10 text-center">
            <p className="text-sm font-semibold text-gray-900">We couldn't load your promotions</p>
            <button type="button" onClick={() => refetch()} className="mt-3 h-9 rounded-lg bg-teal px-4 text-sm font-semibold text-white hover:bg-teal-deep">
              Try again
            </button>
          </div>
        ) : isPending ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : promotions.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Megaphone className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-semibold text-gray-900">No promotions yet</p>
            <p className="mt-1 max-w-sm text-sm text-gray-500">Fill quiet hours with a happy hour, a weekend special or an M-Pesa offer.</p>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {promotions.map((promotion) => {
              const state = phase(promotion);
              const toggling = update.isPending && update.variables?.id === promotion._id;
              return (
                <li key={promotion._id} className="flex overflow-hidden rounded-2xl border border-gray-200">
                  {promotion.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={promotion.image} alt="" className="hidden w-28 shrink-0 object-cover sm:block" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 text-[15px] font-semibold leading-snug text-gray-900">{promotion.title}</h3>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", state.badge)}>{state.label}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[13px] text-gray-500">{promotion.description}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">
                        {promotion.type === "DISCOUNT"
                          ? `${promotion.discountPercentage}% off`
                          : promotion.type === "PAYMENT_OFFER"
                            ? `Pay by ${paymentMeta(promotion.paymentMethod).label}`
                            : TYPES.find((t) => t.key === promotion.type)?.label}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarRange className="h-3.5 w-3.5" />
                        {formatDate(promotion.startDate)} – {formatDate(promotion.endDate)}
                      </span>
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-600">
                        {toggling ? (
                          <Loader2 className="h-4 w-4 animate-spin text-teal" />
                        ) : (
                          <Switch
                            size="sm"
                            checked={promotion.isActive}
                            onCheckedChange={(isActive) => update.mutate({ id: promotion._id, input: { isActive } })}
                            aria-label={`${promotion.title} active`}
                          />
                        )}
                        {promotion.isActive ? "Active" : "Paused"}
                      </label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setForm({ promotion })}
                          aria-label={`Edit ${promotion.title}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setToDelete(promotion)}
                          aria-label={`Delete ${promotion.title}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <PromotionForm open={form !== null} promotion={form?.promotion} onClose={() => setForm(null)} />

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete "${toDelete?.title ?? ""}"?`}
        description="It disappears from the guest app straight away. To take it down for a while instead, pause it."
        confirmLabel="Delete promotion"
        destructive
        busy={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete._id, { onSuccess: () => setToDelete(null) })}
      />
    </>
  );
}

function PromotionForm({ open, promotion, onClose }: { open: boolean; promotion?: Promotion; onClose: () => void }) {
  const create = useCreatePromotion();
  const update = useUpdatePromotion();
  const busy = create.isPending || update.isPending;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<PromotionType>("DISCOUNT");
  const [discount, setDiscount] = useState("");
  const [method, setMethod] = useState("mpesa");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(inDays(7));
  const [terms, setTerms] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setTitle(promotion?.title ?? "");
    setDescription(promotion?.description ?? "");
    setType(promotion?.type ?? "DISCOUNT");
    setDiscount(promotion?.discountPercentage ? String(promotion.discountPercentage) : "");
    setMethod(promotion?.paymentMethod || "mpesa");
    setStartDate(promotion ? day(promotion.startDate) : today());
    setEndDate(promotion ? day(promotion.endDate) : inDays(7));
    setTerms(promotion?.termsAndConditions ?? "");
    setImage(null);
    setErrors({});
  }, [open, promotion]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const problems: Record<string, string> = {};
    if (title.trim().length < 3) problems.title = "Give the promotion a title.";
    if (description.trim().length < 10) problems.description = "Describe the offer in a sentence.";
    if (type === "DISCOUNT" && !(Number(discount) >= 1 && Number(discount) <= 100)) problems.discount = "Enter a percentage from 1 to 100.";
    if (!startDate) problems.startDate = "Choose a start date.";
    if (!endDate) problems.endDate = "Choose an end date.";
    else if (startDate && endDate < startDate) problems.endDate = "The end date can't be before the start date.";
    setErrors(problems);
    if (Object.keys(problems).length > 0) return;

    const input: PromotionInput = {
      title: title.trim(),
      description: description.trim(),
      type,
      discountPercentage: type === "DISCOUNT" ? Number(discount) : undefined,
      paymentMethod: type === "PAYMENT_OFFER" ? method : undefined,
      startDate,
      endDate,
      isActive: promotion?.isActive ?? true,
      termsAndConditions: terms.trim(),
      image,
    };

    if (promotion) update.mutate({ id: promotion._id, input }, { onSuccess: onClose });
    else create.mutate(input, { onSuccess: onClose });
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && !busy && onClose()}>
      <SheetContent showCloseButton={false} className="w-full gap-0 overflow-hidden border-l border-gray-200 bg-white p-0 sm:!max-w-lg">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <div>
            <SheetTitle className="text-base font-semibold text-gray-900">{promotion ? "Edit promotion" : "New promotion"}</SheetTitle>
            <SheetDescription className="mt-0.5 text-[13px] text-gray-500">Guests see it in the app between the dates you choose.</SheetDescription>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <Field label="Title" htmlFor="promo-title" error={errors.title}>
              <input id="promo-title" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} aria-invalid={Boolean(errors.title)} placeholder="Weekend seafood feast" className={inputClass} />
            </Field>
            <Field label="Description" htmlFor="promo-description" error={errors.description}>
              <textarea
                id="promo-description"
                value={description}
                maxLength={500}
                onChange={(e) => setDescription(e.target.value)}
                aria-invalid={Boolean(errors.description)}
                placeholder="What guests get and when."
                className={textareaClass}
              />
            </Field>

            <div>
              <p className="mb-2 text-[13px] font-medium text-gray-700">Type</p>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    aria-pressed={type === t.key}
                    onClick={() => setType(t.key)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-2 focus-visible:outline-teal",
                      type === t.key ? "border-teal bg-teal/5" : "border-gray-200 hover:bg-gray-50",
                    )}
                  >
                    <span className="block text-sm font-semibold text-gray-900">{t.label}</span>
                    <span className="block text-xs text-gray-500">{t.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {type === "DISCOUNT" && (
              <Field label="Discount" htmlFor="promo-discount" error={errors.discount} className="max-w-[10rem]">
                <div className="relative">
                  <input
                    id="promo-discount"
                    inputMode="numeric"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    aria-invalid={Boolean(errors.discount)}
                    placeholder="20"
                    className={cn(inputClass, "pr-9")}
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">%</span>
                </div>
              </Field>
            )}
            {type === "PAYMENT_OFFER" && (
              <Field label="Applies when paying by" htmlFor="promo-method">
                <select id="promo-method" value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}>
                  {PAYMENT_METHODS.map((key) => (
                    <option key={key} value={key}>
                      {paymentMeta(key).label}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Starts" htmlFor="promo-start" error={errors.startDate}>
                <input id="promo-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} aria-invalid={Boolean(errors.startDate)} className={inputClass} />
              </Field>
              <Field label="Ends" htmlFor="promo-end" error={errors.endDate} hint="Runs through the whole of this day.">
                <input id="promo-end" type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} aria-invalid={Boolean(errors.endDate)} className={inputClass} />
              </Field>
            </div>

            <Field label="Terms" htmlFor="promo-terms" optional>
              <textarea id="promo-terms" value={terms} maxLength={1000} onChange={(e) => setTerms(e.target.value)} placeholder="Dine-in only. One per table." className={cn(textareaClass, "min-h-[72px]")} />
            </Field>

            <div>
              <p className="mb-2 flex items-baseline justify-between text-[13px] font-medium text-gray-700">
                Image <span className="text-xs font-normal text-gray-400">Optional</span>
              </p>
              <ImageDrop file={image} onChange={setImage} currentUrl={promotion?.image} label="Add an image" hint="Without one, your cover photo is used." />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
            <button type="button" onClick={onClose} disabled={busy} className="h-10 rounded-xl px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-xl bg-teal px-5 text-sm font-semibold text-white transition hover:bg-teal-deep disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {promotion ? "Save changes" : "Launch promotion"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
