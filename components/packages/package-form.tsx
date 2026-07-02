"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createPackageAction, updatePackageAction } from "@/app/actions/packages";
import { FormMessage } from "@/components/auth/form-fields";
import { FormField } from "@/components/customers/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { Textarea } from "@/components/ui/textarea";
import type { Package } from "@/types/database";

function Save({ editing }: { editing: boolean }) { const { pending } = useFormStatus(); return <Button type="submit" size="lg" disabled={pending}>{pending ? "Saving…" : editing ? "Save Changes" : "Add Package"}</Button>; }
export function PackageForm({ packageRecord }: { packageRecord?: Package }) { const editing = Boolean(packageRecord); const [state, action] = useActionState(editing ? updatePackageAction : createPackageAction, {}); return <form action={action} className="space-y-6">{packageRecord ? <input type="hidden" name="package_id" value={packageRecord.id} /> : null}<FormMessage error={state.error} /><FormField label="Package Name" required><Input name="name" required defaultValue={packageRecord?.name} placeholder="Classic Package" /></FormField><FormField label="Description"><Textarea name="description" defaultValue={packageRecord?.description ?? ""} placeholder="Describe the display and the kind of customer this package fits." /></FormField><div className="grid gap-5 sm:grid-cols-2"><FormField label="Base Price" required><Input name="base_price" type="number" min="0" step="0.01" inputMode="decimal" required defaultValue={packageRecord?.base_price ?? "0"} /></FormField><FormField label="Display Order"><Input name="display_order" type="number" min="0" step="1" inputMode="numeric" defaultValue={packageRecord?.display_order ?? 0} /></FormField><FormField label="Recommended Budget Minimum"><Input name="recommended_budget_min" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={packageRecord?.recommended_budget_min ?? ""} /></FormField><FormField label="Recommended Budget Maximum"><Input name="recommended_budget_max" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={packageRecord?.recommended_budget_max ?? ""} /></FormField></div><label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800"><input name="active" type="checkbox" defaultChecked={packageRecord?.active ?? true} className="size-5 accent-amber-500" />Active package</label><div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"><LinkButton href={packageRecord ? `/packages/${packageRecord.id}` : "/packages"} variant="secondary" size="lg">Cancel</LinkButton><Save editing={editing} /></div></form>; }
