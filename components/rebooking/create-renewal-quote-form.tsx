"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { RefreshCcw } from "lucide-react";
import { createRenewalQuoteAction, type RenewalQuoteActionState } from "@/app/actions/rebooking";
import { Button } from "@/components/ui/button";

function Submit() {
  const { pending } = useFormStatus();
  return <Button type="submit" size="sm" disabled={pending}><RefreshCcw aria-hidden="true" className="mr-1.5 size-3.5" />{pending ? "Creating…" : "Create Renewal Quote"}</Button>;
}

export function CreateRenewalQuoteForm({ sourceJobId }: { sourceJobId: string }) {
  const [state, action] = useActionState<RenewalQuoteActionState, FormData>(createRenewalQuoteAction, {});
  return <form action={action} className="space-y-2"><input type="hidden" name="source_job_id" value={sourceJobId} /><Submit />{state.error ? <p role="alert" className="max-w-64 text-xs font-medium text-red-700">{state.error}</p> : null}</form>;
}
