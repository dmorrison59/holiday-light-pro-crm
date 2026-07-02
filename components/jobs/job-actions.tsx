"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, CircleDollarSign, PackageCheck, X } from "lucide-react";
import { quickUpdateJobAction } from "@/app/actions/jobs";
import { FormMessage } from "@/components/auth/form-fields";
import { Button } from "@/components/ui/button";
const icons = { scheduled: Check, materials_ready: PackageCheck, installed: Check, takedown_scheduled: Check, takedown_complete: Check, complete: Check, canceled: X, deposit_paid: CircleDollarSign, paid: CircleDollarSign };
export function JobQuickAction({ jobId, status, paymentStatus, label }: { jobId: string; status?: string; paymentStatus?: string; label: string }) { const [state, action] = useActionState(quickUpdateJobAction, {}); const key = (status || paymentStatus || "scheduled") as keyof typeof icons; const Icon = icons[key] ?? Check; return <form action={action} className="space-y-2"><input type="hidden" name="job_id" value={jobId} />{status ? <input type="hidden" name="status" value={status} /> : null}{paymentStatus ? <input type="hidden" name="payment_status" value={paymentStatus} /> : null}<FormMessage error={state.error} /><Submit label={label} icon={Icon} /></form>; }
function Submit({ label, icon: Icon }: { label: string; icon: typeof Check }) { const { pending } = useFormStatus(); return <Button type="submit" variant={label.includes("Cancel") ? "danger" : "secondary"} disabled={pending}><Icon className="mr-2 size-4" />{pending ? "Updating…" : label}</Button>; }
