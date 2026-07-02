"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createCatalogItemAction, updateCatalogItemAction } from "@/app/actions/catalog";
import { FormMessage } from "@/components/auth/form-fields";
import { FormField } from "@/components/customers/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { catalogItemTemplates } from "@/lib/catalog-templates";
import { catalogCategories, catalogUnitTypes, pricingMethods } from "@/lib/crm-options";
import type { CatalogItem } from "@/types/database";

function SaveButton({ editing }: { editing: boolean }) { const { pending } = useFormStatus(); return <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>{pending ? "Saving…" : editing ? "Save Changes" : "Add Catalog Item"}</Button>; }
const hasValue = (values: readonly string[], value?: string) => Boolean(value && values.includes(value));

export function CatalogItemForm({ item }: { item?: CatalogItem }) {
  const editing = Boolean(item);
  const [state, action] = useActionState(editing ? updateCatalogItemAction : createCatalogItemAction, {});
  const [templateName, setTemplateName] = useState("");
  const [fields, setFields] = useState({
    name: item?.name ?? "",
    category: item?.category ?? "Roofline Lights",
    description: item?.description ?? "",
    pricingMethod: item?.pricing_method ?? "each",
    unitType: item?.unit_type ?? "each",
    unitPrice: item?.unit_price ?? "0",
    cost: item?.cost ?? "",
    active: item?.active ?? true,
    customerFacing: item?.customer_facing ?? true,
    trackInventory: item?.track_inventory ?? false,
  });

  const chooseTemplate = (name: string) => {
    setTemplateName(name);
    const template = catalogItemTemplates.find((candidate) => candidate.name === name);
    if (!template) return;
    setFields((current) => ({ ...current, name: template.name, category: template.category, description: template.description, pricingMethod: template.pricingMethod, unitType: template.unitType, unitPrice: template.unitPrice, cost: template.cost, customerFacing: template.customerFacing, trackInventory: template.trackInventory }));
  };

  return <form action={action} className="space-y-6">
    {item ? <input type="hidden" name="catalog_item_id" value={item.id} /> : null}<FormMessage error={state.error} />
    {!editing ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><FormField label="Choose starter item template" hint="Optional. Pick a common item to fill the form, then change anything you need."><Select value={templateName} onChange={(event) => chooseTemplate(event.target.value)}><option value="">Choose a starter item…</option>{catalogItemTemplates.map((template) => <option key={template.name} value={template.name}>{template.name}</option>)}</Select></FormField></div> : null}
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField label="Item Name" required hint="Use any name that makes sense to your company."><Input name="name" required value={fields.name} onChange={(event) => setFields((current) => ({ ...current, name: event.target.value }))} placeholder="C9 Warm White Roofline Lights" /></FormField>
      <FormField label="Category" required><Select name="category" required value={fields.category} onChange={(event) => setFields((current) => ({ ...current, category: event.target.value }))}>{item && !hasValue(catalogCategories, item.category) ? <option value={item.category}>{item.category}</option> : null}{catalogCategories.map((category) => <option key={category} value={category}>{category}</option>)}</Select></FormField>
    </div>
    <FormField label="Description" hint="Optional helper text—short and practical is fine."><Textarea name="description" value={fields.description} onChange={(event) => setFields((current) => ({ ...current, description: event.target.value }))} placeholder="What this item is and when your crew uses it." /></FormField>
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField label="How is this priced?" required><Select name="pricing_method" required value={fields.pricingMethod} onChange={(event) => setFields((current) => ({ ...current, pricingMethod: event.target.value }))}>{item && !pricingMethods.some((method) => method.value === item.pricing_method) ? <option value={item.pricing_method}>{item.pricing_method.replaceAll("_", " ")}</option> : null}{pricingMethods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}</Select></FormField>
      <FormField label="Unit type" required><Select name="unit_type" required value={fields.unitType} onChange={(event) => setFields((current) => ({ ...current, unitType: event.target.value }))}>{item && !hasValue(catalogUnitTypes, item.unit_type) ? <option value={item.unit_type}>{item.unit_type}</option> : null}{catalogUnitTypes.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</Select></FormField>
      <FormField label="Unit price" required><Input name="unit_price" type="number" min="0" step="0.01" inputMode="decimal" required value={fields.unitPrice} onChange={(event) => setFields((current) => ({ ...current, unitPrice: event.target.value }))} /></FormField>
      <FormField label="Cost"><Input name="cost" type="number" min="0" step="0.01" inputMode="decimal" value={fields.cost} onChange={(event) => setFields((current) => ({ ...current, cost: event.target.value }))} /></FormField>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800"><input name="active" type="checkbox" checked={fields.active} onChange={(event) => setFields((current) => ({ ...current, active: event.target.checked }))} className="size-5 accent-amber-500" />Active item</label>
      <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800"><input name="customer_facing" type="checkbox" checked={fields.customerFacing} onChange={(event) => setFields((current) => ({ ...current, customerFacing: event.target.checked }))} className="size-5 accent-amber-500" />Customer can see this item</label>
      <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800"><input name="track_inventory" type="checkbox" checked={fields.trackInventory} onChange={(event) => setFields((current) => ({ ...current, trackInventory: event.target.checked }))} className="size-5 accent-amber-500" />Track inventory for this item</label>
    </div>
    <fieldset className={fields.trackInventory ? "space-y-4" : "space-y-4 opacity-60"}><legend className="text-base font-bold text-slate-950">Inventory</legend><p className="text-sm text-slate-500">{fields.trackInventory ? "Keep simple counts for stock visibility." : "These values are stored but stock warnings are off."}</p><div className="grid gap-5 sm:grid-cols-3"><FormField label="Quantity available"><Input name="quantity_available" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={item?.quantity_available ?? "0"} /></FormField><FormField label="Quantity reserved"><Input name="quantity_reserved" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={item?.quantity_reserved ?? "0"} /></FormField><FormField label="Reorder when quantity reaches"><Input name="reorder_threshold" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={item?.reorder_threshold ?? "0"} /></FormField></div><FormField label="Storage location"><Input name="storage_location" defaultValue={item?.storage_location ?? ""} placeholder="Holiday shelf, trailer bin 3…" /></FormField></fieldset>
    <FormField label="Notes"><Textarea name="notes" defaultValue={item?.notes ?? ""} placeholder="Internal purchasing, installation, or storage notes." /></FormField>
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"><LinkButton href={item ? `/catalog/${item.id}` : "/catalog"} variant="secondary" size="lg" className="w-full sm:w-auto">Cancel</LinkButton><SaveButton editing={editing} /></div>
  </form>;
}
