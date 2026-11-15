"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Megaphone, Store, UserRound, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountSettings } from "./AccountSettings";
import { PromotionSettings } from "./PromotionSettings";
import { RestaurantSettings } from "./RestaurantSettings";
import { StaffSettings } from "./StaffSettings";

const TABS = [
  { key: "restaurant", label: "Restaurant", icon: Store },
  { key: "staff", label: "Staff", icon: Users },
  { key: "promotions", label: "Promotions", icon: Megaphone },
  { key: "account", label: "Account", icon: UserRound },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function SettingsContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  // The tab lives in the URL so it can be linked to and survives a reload.
  const tab: TabKey = TABS.some((t) => t.key === params.get("tab")) ? (params.get("tab") as TabKey) : "restaurant";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-4 md:p-6 lg:p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Your restaurant's profile, team, offers and your own account.</p>
      </header>

      <div role="tablist" aria-label="Settings sections" className="flex gap-1 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => router.replace(t.key === "restaurant" ? pathname : `${pathname}?tab=${t.key}`, { scroll: false })}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-teal",
              tab === t.key ? "bg-teal text-white shadow-sm" : "text-gray-600 hover:bg-gray-100",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "restaurant" && <RestaurantSettings />}
      {tab === "staff" && <StaffSettings />}
      {tab === "promotions" && <PromotionSettings />}
      {tab === "account" && <AccountSettings />}
    </div>
  );
}
