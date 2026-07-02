"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { deleteCustomerAction } from "@/app/actions/customers";
import { FormMessage } from "@/components/auth/form-fields";
import { Button } from "@/components/ui/button";

function DeleteButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" variant="danger" disabled={pending}><Trash2 className="mr-2 size-4" />{pending ? "Deleting…" : "Delete Customer"}</Button>;
}

export function DeleteCustomerForm({ customerId, customerName }: { customerId: string; customerName: string }) {
  const [state, action] = useActionState(deleteCustomerAction, {});
  return (
    <form action={action} onSubmit={(event) => { if (!window.confirm(`Delete ${customerName} and all of their properties? This cannot be undone.`)) event.preventDefault(); }} className="space-y-3">
      <input type="hidden" name="customer_id" value={customerId} />
      <FormMessage error={state.error} />
      <DeleteButton />
    </form>
  );
}
