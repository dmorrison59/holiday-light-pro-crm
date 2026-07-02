"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Send, Trash2, X } from "lucide-react";
import { deleteDraftQuoteAction, updateQuoteStatusAction } from "@/app/actions/quotes";
import { FormMessage } from "@/components/auth/form-fields";
import { Button } from "@/components/ui/button";

const icons = { sent: Send, approved: Check, declined: X, draft: Send, viewed: Send, expired: X };
function StatusSubmit({ status }: { status: keyof typeof icons }) { const { pending } = useFormStatus(); const Icon = icons[status]; return <Button type="submit" variant={status === "approved" ? "primary" : "secondary"} disabled={pending}><Icon className="mr-2 size-4" />{pending ? "Updating…" : `Mark ${status[0].toUpperCase() + status.slice(1)}`}</Button>; }
export function QuoteStatusForm({ quoteId, status }: { quoteId: string; status: keyof typeof icons }) { const [state, action] = useActionState(updateQuoteStatusAction, {}); return <form action={action} className="space-y-2"><input type="hidden" name="quote_id" value={quoteId} /><input type="hidden" name="status" value={status} /><FormMessage error={state.error} /><StatusSubmit status={status} /></form>; }
export function DeleteDraftQuoteForm({ quoteId }: { quoteId: string }) { const [state, action] = useActionState(deleteDraftQuoteAction, {}); const { } = state; return <form action={action} onSubmit={(event) => { if (!window.confirm("Delete this draft quote?")) event.preventDefault(); }} className="space-y-2"><input type="hidden" name="quote_id" value={quoteId} /><FormMessage error={state.error} /><Button type="submit" variant="danger"><Trash2 className="mr-2 size-4" />Delete Draft</Button></form>; }
