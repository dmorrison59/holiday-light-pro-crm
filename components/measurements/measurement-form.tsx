"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createMeasurementAction, updateMeasurementAction } from "@/app/actions/measurements";
import { FormMessage } from "@/components/auth/form-fields";
import { CatalogItemCombobox } from "@/components/catalog/catalog-item-combobox";
import { FormField } from "@/components/customers/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { difficultyOptions, heightLevels, measurementTypes, measurementUnits } from "@/lib/crm-options";
import { customerName, propertyAddress } from "@/lib/format";
import type { MeasurementCatalogItem, MeasurementRecord } from "@/lib/measurements";
import type { SiteVisitRecord } from "@/lib/site-visits";

const defaultUnits: Record<string, string> = {
  Roofline: "ft", "Ridge Line": "ft", Walkway: "ft", Driveway: "ft", Garland: "ft", "Garland Area": "ft", Fence: "ft",
  "Peak/Gable": "each", Tree: "tree", Shrub: "bush", Bush: "bush", Wreath: "each", Window: "window", Door: "door",
};

function SaveButtons({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">{!editing ? <Button type="submit" name="intent" value="add_another" variant="secondary" size="lg" disabled={pending}>{pending ? "Saving…" : "Save and Add Another"}</Button> : null}<Button type="submit" name="intent" value="save" size="lg" disabled={pending}>{pending ? "Saving…" : editing ? "Save Changes" : "Save Measurement"}</Button></div>;
}

export function MeasurementForm({ siteVisit, catalogItems, measurement }: { siteVisit: SiteVisitRecord; catalogItems: MeasurementCatalogItem[]; measurement?: MeasurementRecord }) {
  const editing = Boolean(measurement);
  const [measurementType, setMeasurementType] = useState(measurement?.measurement_type ?? "Roofline");
  const [unit, setUnit] = useState(measurement?.unit ?? "ft");
  const initialDifficulty = measurement?.difficulty ?? "Normal";
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [multiplier, setMultiplier] = useState(measurement?.difficulty_multiplier ?? difficultyOptions.find((option) => option.label === initialDifficulty)?.multiplier ?? "1.0");
  const [state, action] = useActionState(editing ? updateMeasurementAction : createMeasurementAction, {});

  return <form action={action} className="space-y-6"><input type="hidden" name="site_visit_id" value={siteVisit.id} />{measurement ? <input type="hidden" name="measurement_id" value={measurement.id} /> : null}<FormMessage error={state.error} />
    <div className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Customer</p><p className="mt-1 text-sm font-semibold text-slate-900">{customerName(siteVisit.customer.first_name, siteVisit.customer.last_name)}</p></div><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Property</p><p className="mt-1 text-sm font-semibold text-slate-900">{siteVisit.property.property_name || propertyAddress(siteVisit.property)}</p></div>{siteVisit.property.access_notes ? <div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Access</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{siteVisit.property.access_notes}</p></div> : null}{siteVisit.property.outlet_notes ? <div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Power outlets</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{siteVisit.property.outlet_notes}</p></div> : null}</div>
    <FormField label="Zone name" required hint="For example: Front roofline, Garage peak, or Porch railing"><Input name="zone_name" required defaultValue={measurement?.zone_name} placeholder="Front roofline" /></FormField>
    <div className="grid gap-5 sm:grid-cols-2"><FormField label="Measurement type" required><Select name="measurement_type" required value={measurementType} onChange={(event) => { const next = event.target.value; setMeasurementType(next); setUnit(defaultUnits[next] ?? "each"); }}>{measurementTypes.map((type) => <option key={type} value={type}>{type}</option>)}</Select></FormField><FormField label="Unit" required><Select name="unit" required value={unit} onChange={(event) => setUnit(event.target.value)}>{measurementUnits.map((option) => <option key={option} value={option}>{option}</option>)}</Select></FormField></div>
    <div className="grid gap-5 sm:grid-cols-2"><FormField label="Quantity" required hint={unit === "ft" ? "Enter measured linear feet." : "Enter the number of items."}><Input name="quantity" type="number" required min="0.01" step="0.01" inputMode="decimal" defaultValue={measurement?.quantity ?? ""} placeholder={unit === "ft" ? "0.00" : "0"} /></FormField><FormField label="Roof height / access"><Select name="height_level" defaultValue={measurement?.height_level ?? "Ground level"}>{heightLevels.map((level) => <option key={level} value={level}>{level}</option>)}</Select></FormField></div>
    <div className="grid gap-5 sm:grid-cols-2"><FormField label="Difficulty"><Select name="difficulty" value={difficulty} onChange={(event) => { const next = event.target.value; setDifficulty(next); const preset = difficultyOptions.find((option) => option.label === next); if (preset && next !== "Custom") setMultiplier(preset.multiplier); }}>{difficultyOptions.map((option) => <option key={option.label} value={option.label}>{option.label}</option>)}</Select></FormField><FormField label="Difficulty multiplier" hint="You can adjust the suggested multiplier."><Input name="difficulty_multiplier" type="number" min="0" step="0.01" inputMode="decimal" value={multiplier} onChange={(event) => setMultiplier(event.target.value)} required /></FormField></div>
    <FormField label="Catalog item" hint="Optional. Search by item name, category, or description."><CatalogItemCombobox items={catalogItems} defaultValue={measurement?.catalog_item_id ?? ""} /></FormField>
    {!catalogItems.length ? <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">No active catalog items yet. You can add measurements now and assign catalog items later.</div> : null}
    <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800"><input name="included_in_quote" type="checkbox" defaultChecked={measurement?.included_in_quote ?? true} className="size-5 accent-amber-500" />Include this measurement in the future quote</label>
    <FormField label="Field and crew notes" hint="Capture roof height/access, power details specific to this zone, installation, removal, and storage instructions. Property-wide outlet and access notes remain on the property."><Textarea name="notes" defaultValue={measurement?.notes ?? ""} className="min-h-40" placeholder={"Roof/access: 2-story rear eave; ladder from driveway\nPower: Use outlet by garage\nInstall: Start at left downspout\nRemoval: Label clips by zone\nStorage: Bin A — front roofline"} /></FormField>
    <div className="sticky bottom-0 -mx-5 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:border-slate-100 sm:bg-transparent sm:px-0 sm:pt-6"><LinkButton href={measurement ? `/measurements/${measurement.id}` : `/site-visits/${siteVisit.id}`} variant="ghost" size="lg">Cancel</LinkButton><SaveButtons editing={editing} /></div>
  </form>;
}
