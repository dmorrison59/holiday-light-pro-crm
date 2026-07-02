"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/auth/form-fields";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, {});
  return <form action={action} className="space-y-5"><FormMessage error={state.error} /><Field label="Email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" /><Field label="Password" name="password" type="password" required autoComplete="current-password" /><SubmitButton label="Log In" pendingLabel="Logging in..." /></form>;
}
