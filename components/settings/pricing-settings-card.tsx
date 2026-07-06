"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { DollarSign, RotateCcw } from "lucide-react";
import { savePricingSettingsAction } from "@/app/actions/pricing";
import { FormField } from "@/components/customers/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getOrganizationPrice, pricingRules, pricingSettingFields } from "@/lib/pricing";
import type { OrganizationPricingSettings } from "@/types/database";

function SaveButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save Pricing"}</Button>;
}

export function PricingSettingsCard({ settings }: { settings: OrganizationPricingSettings | null }) {
  const [state, action] = useActionState(savePricingSettingsAction, {});
  return <Card><CardHeader><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><DollarSign className="size-5" /></span><div><h2 className="font-bold text-slate-950">Quote Pricing</h2><p className="mt-1 text-sm text-slate-500">Organization defaults used when a package override or assigned catalog price is not available.</p></div></div></CardHeader><CardContent><form action={action} className="space-y-5">{state.error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{state.error}</p> : null}{state.success ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{state.success}</p> : null}<div className="grid gap-4 sm:grid-cols-2">{pricingRules.map((rule) => <FormField key={rule.category} label={rule.label} hint={rule.unit === "ft" ? "Price per linear foot" : rule.unit === "hour" ? "Hourly rate" : `Price per ${rule.unit}`}><Input name={String(pricingSettingFields[rule.category])} type="number" min="0" step="0.01" inputMode="decimal" defaultValue={getOrganizationPrice(settings, rule.category)} /></FormField>)}</div><div className="grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2"><label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800"><input name="removal_included" type="checkbox" defaultChecked={settings?.removal_included ?? true} className="size-5 accent-emerald-700" />Removal included by default</label><label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800"><input name="storage_included" type="checkbox" defaultChecked={settings?.storage_included ?? false} className="size-5 accent-emerald-700" />Storage included by default</label><div className="sm:col-span-2"><FormField label="Minimum job price" hint="Optional. Leave blank to disable the minimum-price notice."><Input name="minimum_job_price" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={settings?.minimum_job_price ?? ""} placeholder="No minimum" /></FormField></div></div><p className="text-xs leading-5 text-slate-500">Blank price fields use the starter defaults from the application. Catalog prices and package-item overrides continue to take priority.</p><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="submit" name="intent" value="reset" variant="secondary" formNoValidate><RotateCcw className="mr-2 size-4" />Reset to Starter Defaults</Button><SaveButton /></div></form></CardContent></Card>;
}
