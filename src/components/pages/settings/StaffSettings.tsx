"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, KeyRound, Loader2, RefreshCw, Trash2, UserPlus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, inputClass } from "@/components/ui/field";
import { useAddWaiter, useDeleteWaiter, useResendInvite, useWaiters } from "@/hooks/queries";
import { formatDate, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Waiter } from "@/types/api";
import { Card } from "./Card";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9][0-9\s-]{7,16}$/;

const empty = { firstname: "", lastname: "", email: "", phoneNumber: "" };

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Invite code copied");
  } catch {
    toast.error("Couldn't copy. Select the code and copy it manually.");
  }
}

/** The floor team: invite waiters, hand out their invite codes, remove access. */
export function StaffSettings() {
  const { data, isPending, isError, refetch } = useWaiters();
  const add = useAddWaiter();
  const resend = useResendInvite();
  const remove = useDeleteWaiter();

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Partial<typeof empty>>({});
  const [toRemove, setToRemove] = useState<Waiter | null>(null);
  const [toReset, setToReset] = useState<Waiter | null>(null);

  const waiters = data?.waiter ?? [];
  const emailConfigured = data?.emailConfigured ?? false;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const problems: Partial<typeof empty> = {};
    if (!form.firstname.trim()) problems.firstname = "Enter a first name.";
    if (!form.lastname.trim()) problems.lastname = "Enter a last name.";
    if (!EMAIL.test(form.email.trim())) problems.email = "Enter a valid email address.";
    if (!PHONE.test(form.phoneNumber.trim())) problems.phoneNumber = "Enter a phone number, for example +254 712 345678.";
    setErrors(problems);
    if (Object.keys(problems).length > 0) return;
    add.mutate(
      { firstname: form.firstname.trim(), lastname: form.lastname.trim(), email: form.email.trim(), phoneNumber: form.phoneNumber.trim() },
      { onSuccess: () => setForm(empty) },
    );
  };

  const field = (key: keyof typeof empty) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    "aria-invalid": Boolean(errors[key]),
    className: inputClass,
  });

  return (
    <div className="grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <Card title="Add a waiter" description="They get an invite code to sign up in the Swiftab Waiter app." className="lg:self-start">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" htmlFor="w-first" error={errors.firstname}>
              <input id="w-first" autoComplete="off" {...field("firstname")} />
            </Field>
            <Field label="Last name" htmlFor="w-last" error={errors.lastname}>
              <input id="w-last" autoComplete="off" {...field("lastname")} />
            </Field>
          </div>
          <Field label="Email" htmlFor="w-email" error={errors.email} hint="They sign in to the app with this address.">
            <input id="w-email" type="email" autoComplete="off" {...field("email")} />
          </Field>
          <Field label="Phone" htmlFor="w-phone" error={errors.phoneNumber}>
            <input id="w-phone" type="tel" autoComplete="off" placeholder="+254 712 345678" {...field("phoneNumber")} />
          </Field>
          <button
            type="submit"
            disabled={add.isPending}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-teal text-sm font-semibold text-white transition hover:bg-teal-deep disabled:opacity-60"
          >
            {add.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Add waiter
          </button>
        </form>

        <p className="mt-4 rounded-xl bg-gray-50 px-3.5 py-3 text-xs leading-relaxed text-gray-600">
          {emailConfigured
            ? "The invite code is emailed to them and also shown in the list, in case the email goes astray."
            : "The invite code appears in the list. Pass it to the waiter yourself: they enter it with their email in the app, then choose a password."}
        </p>
      </Card>

      <Card title="Your team" description={isPending ? undefined : `${waiters.length} ${waiters.length === 1 ? "person" : "people"}`}>
        {isError ? (
          <div role="alert" className="py-10 text-center">
            <p className="text-sm font-semibold text-gray-900">We couldn't load your team</p>
            <button type="button" onClick={() => refetch()} className="mt-3 h-9 rounded-lg bg-teal px-4 text-sm font-semibold text-white hover:bg-teal-deep">
              Try again
            </button>
          </div>
        ) : isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : waiters.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">No waiters yet. Add your first one to start taking orders on the floor.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {waiters.map((waiter) => {
              const pending = waiter.status === "pending";
              const busy = resend.isPending && resend.variables?.waiterId === waiter.id;
              return (
                <li key={waiter.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 py-4 first:pt-0 last:pb-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                    {initials(`${waiter.firstname} ${waiter.lastname}`)}
                  </span>
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-900">
                      {waiter.firstname} {waiter.lastname}
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                          pending ? "bg-amber-50 text-amber-800 ring-amber-600/20" : "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
                        )}
                      >
                        {pending ? (waiter.inviteExpired ? "Invite expired" : "Invite pending") : waiter.onDuty ? "On duty" : "Active"}
                      </span>
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {waiter.email} · {waiter.phoneNumber}
                    </p>
                    <p className="text-xs text-gray-400">Added {formatDate(waiter.createdAt)}</p>
                  </div>

                  {pending && waiter.inviteCode && (
                    <div className="flex items-center gap-2 rounded-xl bg-gray-50 py-1.5 pl-3 pr-1.5">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Invite code</p>
                        <p className={cn("font-mono text-base font-semibold tracking-[0.2em]", waiter.inviteExpired ? "text-gray-400 line-through" : "text-gray-900")}>
                          {waiter.inviteCode}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copy(waiter.inviteCode!)}
                        disabled={waiter.inviteExpired}
                        aria-label={`Copy invite code for ${waiter.firstname}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white hover:text-gray-900 disabled:opacity-40"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    {pending ? (
                      <button
                        type="button"
                        onClick={() => resend.mutate({ waiterId: waiter.id })}
                        disabled={busy}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        New code
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setToReset(waiter)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-gray-600 transition hover:bg-gray-100"
                      >
                        <KeyRound className="h-3.5 w-3.5" /> Reset access
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setToRemove(waiter)}
                      aria-label={`Remove ${waiter.firstname} ${waiter.lastname}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={toRemove !== null}
        title={`Remove ${toRemove?.firstname ?? "this waiter"}?`}
        description="They are signed out of the waiter app and can no longer see your orders. Orders they already served stay in your reports."
        confirmLabel="Remove waiter"
        destructive
        busy={remove.isPending}
        onCancel={() => setToRemove(null)}
        onConfirm={() => toRemove && remove.mutate(toRemove.id, { onSuccess: () => setToRemove(null) })}
      />
      <ConfirmDialog
        open={toReset !== null}
        title={`Reset ${toReset?.firstname ?? "this waiter"}'s access?`}
        description="Use this when someone forgot their password. Their current password stops working and you get a new invite code to pass on; they sign up again with it."
        confirmLabel="Reset and get a code"
        busy={resend.isPending}
        onCancel={() => setToReset(null)}
        onConfirm={() => toReset && resend.mutate({ waiterId: toReset.id, reset: true }, { onSuccess: () => setToReset(null) })}
      />
    </div>
  );
}
