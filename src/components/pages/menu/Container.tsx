"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Clock, FolderPlus, Loader2, Pencil, Plus, Search, Trash2, UtensilsCrossed } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Field, inputClass } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  useAddCategory,
  useDeleteCategory,
  useDeleteMenuItem,
  useMenu,
  useRenameCategory,
  useReorderCategories,
  useSetAvailability,
} from "@/hooks/queries";
import { formatKes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MenuCategory, MenuItem } from "@/types/api";
import { DishForm } from "./DishForm";

const ALL = "__all__";

type Availability = "all" | "available" | "unavailable";

interface DishRef {
  dish: MenuItem;
  category: MenuCategory;
}

/** Suggestions for restaurants that are still building their menu. */
const SUGGESTED_CATEGORIES = ["Starters", "Mains", "Drinks", "Desserts", "Sides", "Kids", "Specials", "Cocktails"];

export default function MenuManager() {
  const { data, isPending, isError, refetch } = useMenu();
  const categories = useMemo(() => data ?? [], [data]);

  const [active, setActive] = useState<string>(ALL);
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState<Availability>("all");

  const [form, setForm] = useState<{ dish?: MenuItem; categoryKey: string } | null>(null);
  const [dishToDelete, setDishToDelete] = useState<DishRef | null>(null);
  const [categoryDialog, setCategoryDialog] = useState<{ mode: "add" } | { mode: "rename"; category: MenuCategory } | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<MenuCategory | null>(null);

  const setAvailable = useSetAvailability();
  const deleteDish = useDeleteMenuItem();
  const deleteCategory = useDeleteCategory();
  const reorder = useReorderCategories();

  const activeCategory = categories.find((c) => c.key === active) ?? null;
  // The category a deleted or renamed tab pointed at may be gone.
  const tab = active === ALL || activeCategory ? active : ALL;

  const dishes: DishRef[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .filter((category) => tab === ALL || category.key === tab)
      .flatMap((category) => category.items.map((dish) => ({ dish, category })))
      .filter(({ dish }) => {
        const isAvailable = dish.available !== false;
        if (availability === "available" && !isAvailable) return false;
        if (availability === "unavailable" && isAvailable) return false;
        if (!q) return true;
        return (
          dish.name.toLowerCase().includes(q) ||
          (dish.description ?? "").toLowerCase().includes(q) ||
          (dish.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
        );
      });
  }, [categories, tab, query, availability]);

  const total = categories.reduce((sum, c) => sum + c.items.length, 0);
  const unavailable = categories.reduce((sum, c) => sum + c.items.filter((d) => d.available === false).length, 0);

  const move = (category: MenuCategory, direction: -1 | 1) => {
    const order = categories.map((c) => c.key);
    const index = order.indexOf(category.key);
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    reorder.mutate(order);
  };

  if (isError) {
    return (
      <div role="alert" className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-base font-semibold text-gray-900">We couldn't load your menu</p>
        <p className="mt-1 text-sm text-gray-500">Check your connection and try again.</p>
        <button type="button" onClick={() => refetch()} className="mt-4 h-10 rounded-xl bg-teal px-5 text-sm font-semibold text-white hover:bg-teal-deep">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Menu</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isPending
              ? "Loading your menu…"
              : `${total} dish${total === 1 ? "" : "es"} in ${categories.length} section${categories.length === 1 ? "" : "s"}${
                  unavailable ? ` · ${unavailable} switched off` : ""
                }`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCategoryDialog({ mode: "add" })}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <FolderPlus className="h-4 w-4" /> Add section
          </button>
          <button
            type="button"
            disabled={categories.length === 0}
            onClick={() => setForm({ categoryKey: activeCategory?.key ?? categories[0]?.key ?? "" })}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-deep disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add dish
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 p-3">
          <div role="tablist" aria-label="Menu sections" className="flex gap-1 overflow-x-auto">
            <SectionTab label="All" count={total} selected={tab === ALL} onSelect={() => setActive(ALL)} />
            {categories.map((category) => (
              <SectionTab
                key={category.key}
                label={category.label}
                count={category.items.length}
                selected={tab === category.key}
                onSelect={() => setActive(category.key)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-100 p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                aria-label="Search dishes"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes or labels"
                className={cn(inputClass, "h-10 pl-9")}
              />
            </div>
            <select
              aria-label="Filter by availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value as Availability)}
              className={cn(inputClass, "h-10 sm:w-44")}
            >
              <option value="all">All dishes</option>
              <option value="available">Available</option>
              <option value="unavailable">Switched off</option>
            </select>
          </div>

          {activeCategory && (
            <div className="flex flex-wrap items-center gap-1 text-[13px]">
              <span className="mr-1 text-gray-500">{activeCategory.label}:</span>
              <ToolbarButton label="Move section left" onClick={() => move(activeCategory, -1)} disabled={categories[0]?.key === activeCategory.key || reorder.isPending}>
                <ArrowLeft className="h-3.5 w-3.5" />
              </ToolbarButton>
              <ToolbarButton
                label="Move section right"
                onClick={() => move(activeCategory, 1)}
                disabled={categories[categories.length - 1]?.key === activeCategory.key || reorder.isPending}
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </ToolbarButton>
              <ToolbarButton label="Rename section" onClick={() => setCategoryDialog({ mode: "rename", category: activeCategory })}>
                <Pencil className="h-3.5 w-3.5" /> Rename
              </ToolbarButton>
              <ToolbarButton label="Delete section" danger onClick={() => setCategoryToDelete(activeCategory)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </ToolbarButton>
            </div>
          )}
        </div>

        <div className="p-4">
          {isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : dishes.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <UtensilsCrossed className="h-5 w-5" />
              </span>
              <p className="mt-4 text-sm font-semibold text-gray-900">
                {total === 0 ? "Your menu is empty" : query || availability !== "all" ? "No dishes match" : `Nothing in ${activeCategory?.label ?? "this section"} yet`}
              </p>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                {total === 0
                  ? "Add your first dish and guests can order it from their table."
                  : query || availability !== "all"
                    ? "Try a different search or filter."
                    : "Add a dish to this section, or move one here by editing it."}
              </p>
              {categories.length > 0 && !query && availability === "all" && (
                <button
                  type="button"
                  onClick={() => setForm({ categoryKey: activeCategory?.key ?? categories[0].key })}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white hover:bg-teal-deep"
                >
                  <Plus className="h-4 w-4" /> Add dish
                </button>
              )}
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {dishes.map(({ dish, category }) => (
                <DishCard
                  key={dish._id}
                  dish={dish}
                  sectionLabel={tab === ALL ? category.label : undefined}
                  onEdit={() => setForm({ dish, categoryKey: category.key })}
                  onDelete={() => setDishToDelete({ dish, category })}
                  onToggle={(available) => setAvailable.mutate({ category: category.key, itemId: dish._id, available })}
                  toggling={setAvailable.isPending && setAvailable.variables?.itemId === dish._id}
                />
              ))}
            </ul>
          )}
        </div>
      </section>

      <DishForm
        open={form !== null}
        onClose={() => setForm(null)}
        categories={categories}
        dish={form?.dish}
        categoryKey={form?.categoryKey ?? categories[0]?.key ?? ""}
      />

      <CategoryDialog state={categoryDialog} existing={categories} onClose={() => setCategoryDialog(null)} onAdded={(key) => setActive(key)} />

      <ConfirmDialog
        open={dishToDelete !== null}
        title={`Delete ${dishToDelete?.dish.name ?? "this dish"}?`}
        description="It is removed from your menu and the guest app. Past orders that include it are not affected."
        confirmLabel="Delete dish"
        destructive
        busy={deleteDish.isPending}
        onCancel={() => setDishToDelete(null)}
        onConfirm={() =>
          dishToDelete &&
          deleteDish.mutate({ category: dishToDelete.category.key, itemId: dishToDelete.dish._id }, { onSuccess: () => setDishToDelete(null) })
        }
      />

      <ConfirmDialog
        open={categoryToDelete !== null}
        title={`Delete the ${categoryToDelete?.label ?? ""} section?`}
        description={
          categoryToDelete && categoryToDelete.items.length > 0
            ? `This also deletes the ${categoryToDelete.items.length} dish${categoryToDelete.items.length === 1 ? "" : "es"} in it. To keep them, move them to another section first.`
            : "The section is empty, so nothing else is removed."
        }
        confirmLabel={categoryToDelete && categoryToDelete.items.length > 0 ? "Delete section and dishes" : "Delete section"}
        destructive
        busy={deleteCategory.isPending}
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={() =>
          categoryToDelete &&
          deleteCategory.mutate(
            { key: categoryToDelete.key, force: categoryToDelete.items.length > 0 },
            {
              onSuccess: () => {
                setCategoryToDelete(null);
                setActive(ALL);
              },
            },
          )
        }
      />
    </div>
  );
}

function SectionTab({ label, count, selected, onSelect }: { label: string; count: number; selected: boolean; onSelect: () => void }) {
  return (
    <button
      role="tab"
      type="button"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition focus-visible:outline-2 focus-visible:outline-teal",
        selected ? "bg-teal text-white" : "text-gray-600 hover:bg-gray-100",
      )}
    >
      {label}
      <span className={cn("rounded-md px-1.5 py-0.5 text-[11px] tabular-nums", selected ? "bg-white/20" : "bg-gray-100 text-gray-500")}>{count}</span>
    </button>
  );
}

function ToolbarButton({
  label,
  danger,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
        danger ? "text-rose-600 hover:bg-rose-50" : "text-gray-600 hover:bg-gray-100",
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function DishCard({
  dish,
  sectionLabel,
  onEdit,
  onDelete,
  onToggle,
  toggling,
}: {
  dish: MenuItem;
  sectionLabel?: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (available: boolean) => void;
  toggling: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const available = dish.available !== false;

  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-md">
      <div className="relative aspect-[16/10] bg-gray-100">
        {dish.image && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dish.image}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            className={cn("h-full w-full object-cover transition", !available && "opacity-50 grayscale")}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <UtensilsCrossed className="h-8 w-8" />
          </div>
        )}
        {!available && (
          <span className="absolute left-3 top-3 rounded-full bg-gray-900/85 px-2.5 py-1 text-[11px] font-semibold text-white">Switched off</span>
        )}
        {sectionLabel && (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-gray-700 shadow-sm">{sectionLabel}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-[15px] font-semibold leading-snug text-gray-900">{dish.name}</h3>
          <p className="shrink-0 text-[15px] font-semibold tabular-nums text-gray-900">{formatKes(dish.cost)}</p>
        </div>
        {dish.description && <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-gray-500">{dish.description}</p>}

        {(Boolean(dish.tags?.length) || Boolean(dish.prepTime)) && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {dish.tags?.map((tag) => (
              <span key={tag} className="rounded-full bg-teal/10 px-2 py-0.5 text-[11px] font-semibold text-teal-deep">
                {tag}
              </span>
            ))}
            {Boolean(dish.prepTime) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                <Clock className="h-3 w-3" /> {dish.prepTime} min
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-600">
            {toggling ? (
              <Loader2 className="h-4 w-4 animate-spin text-teal" />
            ) : (
              <Switch size="sm" checked={available} onCheckedChange={onToggle} aria-label={`${dish.name} available to order`} />
            )}
            {available ? "Available" : "Unavailable"}
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${dish.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${dish.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function CategoryDialog({
  state,
  existing,
  onClose,
  onAdded,
}: {
  state: { mode: "add" } | { mode: "rename"; category: MenuCategory } | null;
  existing: MenuCategory[];
  onClose: () => void;
  onAdded: (key: string) => void;
}) {
  const add = useAddCategory();
  const rename = useRenameCategory();
  const busy = add.isPending || rename.isPending;
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [seenState, setSeenState] = useState(state);

  // Reset the field each time the dialog opens for a different purpose.
  if (state !== seenState) {
    setSeenState(state);
    setLabel(state?.mode === "rename" ? state.category.label : "");
    setError(null);
  }

  const suggestions = SUGGESTED_CATEGORIES.filter((s) => !existing.some((c) => c.label.toLowerCase() === s.toLowerCase())).slice(0, 6);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const name = label.trim();
    if (!name) {
      setError("Give the section a name.");
      return;
    }
    const clash = existing.some((c) => c.label.toLowerCase() === name.toLowerCase() && (state?.mode !== "rename" || c.key !== state.category.key));
    if (clash) {
      setError("You already have a section with that name.");
      return;
    }
    if (state?.mode === "rename") {
      rename.mutate({ key: state.category.key, label: name }, { onSuccess: onClose });
    } else {
      add.mutate(name, {
        onSuccess: (result) => {
          const key = (result as { category?: { key: string } }).category?.key;
          if (key) onAdded(key);
          onClose();
        },
      });
    }
  };

  return (
    <Dialog open={state !== null} onOpenChange={(next) => !next && !busy && onClose()}>
      <DialogContent showCloseButton={false} className="gap-0 rounded-2xl border-0 bg-white p-6 shadow-2xl sm:max-w-md">
        <DialogTitle className="text-base font-semibold text-gray-900">{state?.mode === "rename" ? "Rename section" : "Add a menu section"}</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-gray-500">
          {state?.mode === "rename" ? "Guests see the new name straight away." : "Sections group your dishes: drinks, starters, desserts and so on."}
        </DialogDescription>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <Field label="Section name" htmlFor="section-name" error={error ?? undefined}>
            <input
              id="section-name"
              autoFocus
              value={label}
              maxLength={40}
              onChange={(e) => {
                setLabel(e.target.value);
                setError(null);
              }}
              aria-invalid={Boolean(error)}
              placeholder="Drinks"
              className={inputClass}
            />
          </Field>
          {state?.mode === "add" && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setLabel(suggestion)}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-teal hover:text-teal"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} disabled={busy} className="h-10 rounded-xl px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal px-5 text-sm font-semibold text-white transition hover:bg-teal-deep disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {state?.mode === "rename" ? "Save name" : "Add section"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
