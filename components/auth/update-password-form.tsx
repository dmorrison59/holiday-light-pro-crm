"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePasswordAction } from "@/app/actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/auth/form-fields";

export function UpdatePasswordForm() {
  const [state, action] = useActionState(updatePasswordAction, {});

  return (
    <form action={action} className="space-y-5">
      <FormMessage error={state.error} />
      <Field label="New password" name="password" type="password" required autoComplete="new-password" />
      <Field label="Confirm new password" name="confirm_password" type="password" required autoComplete="new-password" />
      <p className="text-xs leading-5 text-slate-500">Use at least 8 characters. A longer, unique password is even better.</p>
      <SubmitButton label="Update Password" pendingLabel="Updating password..." />
      <p className="text-center text-sm text-slate-600"><Link href="/forgot-password" className="font-semibold text-[#315b78] hover:text-[#17324d] hover:underline">Request a new recovery email</Link></p>
    </form>
  );
}
