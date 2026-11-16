"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Field, inputClass, textareaClass } from "@/components/ui/field";
import { ChipPicker } from "@/components/restaurant/ChipPicker";
import { ImageDrop } from "@/components/restaurant/ImageDrop";
import { useAddMenuItem, useUpdateMenuItem } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import type { MenuCategory, MenuItem } from "@/types/api";

const TAG_OPTIONS = ["Popular", "Chef pick", "New", "Vegetarian", "Vegan", "Spicy", "Gluten-free", "Halal"];

interface Props {
  open: boolean;
  onClose: () => void;
  categories: MenuCategory[];
  /** The dish being edited; omit to add a new one. */
  dish?: MenuItem | null;
  /** The category the dish is in (edit) or should default to (add). */
  categoryKey: string;
}

/** Adds a dish, or edits one: details, photo, tags, and which section it sits in. */
export function DishForm({ open, onClose, categories, dish, categoryKey }: Props) {
  const add = useAddMenuItem();
  const update = useUpdateMenuItem();
  const busy = add.isPending || update.isPending;

  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categoryKey);
  const [tags, setTags] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState("");
  const [available, setAvailable] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ name?: string; cost?: string }>({});

  // Start from the dish's saved details every time the form opens.
  useEffect(() => {
    if (!open) return;
    setName(dish?.name ?? "");
    setCost(dish ? String(dish.cost) : "");
    setDescription(dish?.description ?? "");
    setCategory(categoryKey);
    setTags(dish?.tags ?? []);
    setPrepTime(dish?.prepTime ? String(dish.prepTime) : "");
    setAvailable(dish?.available !== false);
    setImage(null);
    setErrors({});
  }, [open, dish, categoryKey]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const problems: typeof errors = {};
    if (name.trim().length < 2) problems.name = "Give the dish a name.";
    if (cost.trim() === "" || !(Number(cost) >= 0)) problems.cost = "Enter the price in shillings.";
    setErrors(problems);
    if (Object.keys(problems).length > 0) return;

    const input = {
      name: name.trim(),
      description: description.trim(),
      cost: Number(cost),
      available,
      tags,
      prepTime: prepTime ? Number(prepTime) : 0,
      image,
    };

    if (dish) {
      update.mutate(
        { category: categoryKey, itemId: dish._id, input: { ...input, category: category !== categoryKey ? category : undefined } },
        { onSuccess: onClose },
      );
    } else {
      add.mutate({ category, input }, { onSuccess: onClose });
    }
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && !busy && onClose()}>
      <SheetContent showCloseButton={false} className="w-full gap-0 overflow-hidden border-l border-gray-200 bg-white p-0 sm:!max-w-lg">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <div>
            <SheetTitle className="text-base font-semibold text-gray-900">{dish ? "Edit dish" : "Add a dish"}</SheetTitle>
            <SheetDescription className="mt-0.5 text-[13px] text-gray-500">
              {dish ? "Changes show in the guest app straight away." : "It appears in the guest app as soon as you save."}
            </SheetDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <ImageDrop file={image} onChange={setImage} currentUrl={dish?.image} label="Add a photo" hint="Optional, but dishes with photos get ordered more." />

            <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
              <Field label="Name" htmlFor="dish-name" error={errors.name}>
                <input
                  id="dish-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  placeholder="Swahili fish curry"
                  className={inputClass}
                />
              </Field>
              <Field label="Price" htmlFor="dish-cost" error={errors.cost}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">KES</span>
                  <input
                    id="dish-cost"
                    inputMode="decimal"
                    value={cost}
                    onChange={(e) => setCost(e.target.value.replace(/[^\d.]/g, ""))}
                    aria-invalid={Boolean(errors.cost)}
                    placeholder="1450"
                    className={cn(inputClass, "pl-12")}
                  />
                </div>
              </Field>
            </div>

            <Field label="Menu section" htmlFor="dish-category">
              <select id="dish-category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Description" htmlFor="dish-description" optional>
              <textarea
                id="dish-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
                placeholder="Main ingredients, how it's cooked, what it comes with."
                className={textareaClass}
              />
            </Field>

            <div>
              <p className="mb-2 text-[13px] font-medium text-gray-700">Labels</p>
              <ChipPicker options={TAG_OPTIONS} value={tags} onChange={setTags} max={8} />
            </div>

            <Field label="Preparation time" htmlFor="dish-prep" optional hint="Minutes from order to table.">
              <input
                id="dish-prep"
                inputMode="numeric"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value.replace(/\D/g, "").slice(0, 3))}
                placeholder="20"
                className={cn(inputClass, "max-w-[9rem]")}
              />
            </Field>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-gray-200 px-4 py-3">
              <span>
                <span className="block text-sm font-medium text-gray-900">Available to order</span>
                <span className="block text-xs text-gray-500">Switch off when you run out. The dish stays on your menu here.</span>
              </span>
              <Switch checked={available} onCheckedChange={setAvailable} aria-label="Available to order" />
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
            <button type="button" onClick={onClose} disabled={busy} className="h-10 rounded-xl px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-10 min-w-28 items-center justify-center gap-2 rounded-xl bg-teal px-5 text-sm font-semibold text-white transition hover:bg-teal-deep disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {dish ? "Save changes" : "Add dish"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
