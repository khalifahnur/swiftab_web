"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, LogOut } from "lucide-react";
import { Field, inputClass } from "@/components/ui/field";
import { useAuth } from "@/components/auth/AuthContext";
import { useChangePassword, useUpdateProfile } from "@/hooks/queries";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminInfo } from "@/types/api";
import { Card } from "./Card";

const PLAN_NAMES: Record<string, string> = { starter: "Starter", professional: "Professional", enterprise: "Enterprise" };
const STATUS_NAMES: Record<string, string> = { trialing: "Free trial", active: "Active", past_due: "Payment overdue", canceled: "Cancelled" };

/** The admin's own details, password and plan. */
export function AccountSettings() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Keyed on the saved details so the form picks them up after a save. */}
      <ProfileCard key={`${user.name}|${user.phoneNumber}`} user={user} />
      <PasswordCard />

      <Card title="Plan" description="Your Swiftab subscription.">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Plan</dt>
            <dd className="font-medium text-gray-900">{PLAN_NAMES[user.subscriptionPlan ?? ""] ?? "Starter"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Status</dt>
            <dd className="font-medium text-gray-900">{STATUS_NAMES[user.subscriptionStatus ?? ""] ?? "—"}</dd>
          </div>
          {user.subscriptionStatus === "trialing" && user.trialEndsAt && (
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Trial ends</dt>
              <dd className="font-medium text-gray-900">{formatDate(user.trialEndsAt)}</dd>
            </div>
          )}
        </dl>
        <p className="mt-4 text-xs text-gray-500">
          To change or renew your plan, write to us from the contact page and we'll sort it out.
        </p>
      </Card>

      <Card title="Sign out" description="End your session on this device.">
        <button
          type="button"
          onClick={() => signOut()}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </Card>
    </div>
  );
}

function ProfileCard({ user }: { user: AdminInfo }) {
  const update = useUpdateProfile();
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phoneNumber ?? "");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const dirty = name !== (user.name ?? "") || phone !== (user.phoneNumber ?? "");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const problems: typeof errors = {};
    if (name.trim().length < 2) problems.name = "Enter your name.";
    if (phone.trim().length < 7) problems.phone = "Enter your phone number.";
    setErrors(problems);
    if (Object.keys(problems).length === 0) update.mutate({ name: name.trim(), phoneNumber: phone.trim() });
  };

  return (
    <Card title="Your details" description="Who we contact about this account.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name" htmlFor="acc-name" error={errors.name}>
          <input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(errors.name)} autoComplete="name" className={inputClass} />
        </Field>
        <Field label="Phone" htmlFor="acc-phone" error={errors.phone}>
          <input id="acc-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={Boolean(errors.phone)} autoComplete="tel" className={inputClass} />
        </Field>
        <Field label="Email" htmlFor="acc-email" hint="You sign in with this address. Contact us to change it.">
          <input id="acc-email" value={user.email} disabled readOnly className={inputClass} />
        </Field>
        <button
          type="submit"
          disabled={!dirty || update.isPending}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal px-5 text-sm font-semibold text-white transition hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save details
        </button>
      </form>
    </Card>
  );
}

function PasswordCard() {
  const change = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const problems: typeof errors = {};
    if (!current) problems.current = "Enter your current password.";
    if (next.length < 6) problems.next = "Use at least 6 characters.";
    else if (next === current) problems.next = "Choose a password different from the current one.";
    if (confirm !== next) problems.confirm = "The two passwords don't match.";
    setErrors(problems);
    if (Object.keys(problems).length > 0) return;
    change.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => {
          setCurrent("");
          setNext("");
          setConfirm("");
        },
      },
    );
  };

  const type = show ? "text" : "password";

  return (
    <Card
      title="Password"
      description="Use a password you don't use anywhere else."
      action={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
        >
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {show ? "Hide" : "Show"}
        </button>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Current password" htmlFor="pw-current" error={errors.current}>
          <input id="pw-current" type={type} value={current} onChange={(e) => setCurrent(e.target.value)} aria-invalid={Boolean(errors.current)} autoComplete="current-password" className={inputClass} />
        </Field>
        <Field label="New password" htmlFor="pw-next" error={errors.next}>
          <input id="pw-next" type={type} value={next} onChange={(e) => setNext(e.target.value)} aria-invalid={Boolean(errors.next)} autoComplete="new-password" className={inputClass} />
        </Field>
        <Field label="Repeat new password" htmlFor="pw-confirm" error={errors.confirm}>
          <input id="pw-confirm" type={type} value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={Boolean(errors.confirm)} autoComplete="new-password" className={inputClass} />
        </Field>
        <button
          type="submit"
          disabled={change.isPending || !current || !next || !confirm}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-xl bg-teal px-5 text-sm font-semibold text-white transition hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {change.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Change password
        </button>
      </form>
    </Card>
  );
}
