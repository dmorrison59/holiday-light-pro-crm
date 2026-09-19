"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordRecoveryAction } from "@/app/actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/auth/form-fields";

export function PasswordRecoveryForm() {
  const [state, action] = useActionState(requestPasswordRecoveryAction, {});

  if (state.success) {
    return (
      <div className="space-y-5">
        <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium leading-6 text-blue-950">
          {state.success}
        </div>
        <Link href="/login" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#c8d3dc] bg-[#fffefb] px-4 text-sm font-semibold text-[#17324d] shadow-sm transition-colors hover:border-amber-500 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2">
          Back to Log In
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <FormMessage error={state.error} />
      <Field label="Email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
      <SubmitButton label="Send Reset Link" pendingLabel="Sending reset link..." />
      <p className="text-center text-sm text-slate-600"><Link href="/login" className="font-semibold text-[#315b78] hover:text-[#17324d] hover:underline">Back to Log In</Link></p>
    </form>
  );
}
