"use client";
import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deletePaymentAction } from "@/app/actions/payments";
import { FormMessage } from "@/components/auth/form-fields";
import { Button } from "@/components/ui/button";
export function DeletePaymentForm({ paymentId }: { paymentId: string }) { const [state, action] = useActionState(deletePaymentAction, {}); return <form action={action} onSubmit={(event) => { if (!window.confirm("Delete this payment record?")) event.preventDefault(); }} className="space-y-2"><input type="hidden" name="payment_id" value={paymentId} /><FormMessage error={state.error} /><Button type="submit" variant="ghost" size="sm"><Trash2 className="mr-1.5 size-4" />Delete</Button></form>; }
