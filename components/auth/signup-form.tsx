"use client";

import { useActionState } from "react";
import { signupAction } from "@/app/actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/auth/form-fields";

export function SignupForm() {
  const [state, action] = useActionState(signupAction, {});
  return (
    <form action={action} className="space-y-5">
      <FormMessage error={state.error} />
      <div className="grid gap-5 sm:grid-cols-2"><Field label="First name" name="first_name" required autoComplete="given-name" /><Field label="Last name" name="last_name" required autoComplete="family-name" /></div>
      <Field label="Email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
      <Field label="Password" name="password" type="password" required autoComplete="new-password" />
      <Field label="Confirm password" name="confirm_password" type="password" required autoComplete="new-password" />
      <p className="text-xs leading-5 text-slate-500">Use at least 8 characters. A longer, unique password is even better.</p>
      <SubmitButton label="Create Account" pendingLabel="Creating account..." />
    </form>
  );
}
