"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { deleteMeasurementAction } from "@/app/actions/measurements";
import { FormMessage } from "@/components/auth/form-fields";
import { Button } from "@/components/ui/button";

function DeleteButton({ compact }: { compact?: boolean }) { const { pending } = useFormStatus(); return <Button type="submit" variant="danger" size={compact ? "sm" : "md"} disabled={pending}><Trash2 className="mr-2 size-4" />{pending ? "Deleting…" : "Delete"}</Button>; }

export function DeleteMeasurementForm({ measurementId, zoneName, compact = false }: { measurementId: string; zoneName: string; compact?: boolean }) {
  const [state, action] = useActionState(deleteMeasurementAction, {});
  return <form action={action} onSubmit={(event) => { if (!window.confirm(`Delete the ${zoneName} measurement? This cannot be undone.`)) event.preventDefault(); }} className="space-y-2"><input type="hidden" name="measurement_id" value={measurementId} /><FormMessage error={state.error} /><DeleteButton compact={compact} /></form>;
}
