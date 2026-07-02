"use client";

import { useActionState } from "react";
import { onboardingAction } from "@/app/actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/auth/form-fields";

export function OnboardingForm({ firstName, lastName, userEmail }: { firstName: string; lastName: string; userEmail: string }) {
  const [state, action] = useActionState(onboardingAction, {});
  return (
    <form action={action} className="space-y-5">
      <FormMessage error={state.error} />
      <Field label="Company name" name="company_name" required autoComplete="organization" placeholder="Morrison Holiday Lights" />
      <div className="grid gap-5 sm:grid-cols-2"><Field label="Your first name" name="first_name" required autoComplete="given-name" defaultValue={firstName} /><Field label="Your last name" name="last_name" required autoComplete="family-name" defaultValue={lastName} /></div>
      <div className="grid gap-5 sm:grid-cols-2"><Field label="Company phone" name="phone" type="tel" autoComplete="tel" placeholder="724-555-1000" /><Field label="Company email" name="company_email" type="email" autoComplete="email" defaultValue={userEmail} /></div>
      <Field label="Website" name="website" autoComplete="url" placeholder="morrisonholidaylights.com" />
      <Field label="Address" name="address" autoComplete="street-address" placeholder="Ligonier, PA" />
      <SubmitButton label="Create Company" pendingLabel="Creating company..." />
    </form>
  );
}
