"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPackageItemAction, updatePackageItemAction } from "@/app/actions/packages";
import { FormMessage } from "@/components/auth/form-fields";
import { CatalogItemCombobox } from "@/components/catalog/catalog-item-combobox";
import { FormField } from "@/components/customers/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { MeasurementCatalogItem } from "@/lib/measurements";
import type { PackageItemRecord } from "@/lib/packages";

function Save({ editing }: { editing: boolean }) { const { pending } = useFormStatus(); return <Button type="submit" size="lg" disabled={pending}>{pending ? "Saving…" : editing ? "Save Changes" : "Add Item"}</Button>; }
export function PackageItemForm({ packageId, catalogItems, item, defaultType = "included" }: { packageId: string; catalogItems: MeasurementCatalogItem[]; item?: PackageItemRecord; defaultType?: "included" | "addon" }) { const editing = Boolean(item); const [state, action] = useActionState(editing ? updatePackageItemAction : createPackageItemAction, {}); const [unit, setUnit] = useState(item?.unit ?? "each"); return <form action={action} className="space-y-6"><input type="hidden" name="package_id" value={packageId} />{item ? <input type="hidden" name="package_item_id" value={item.id} /> : null}<FormMessage error={state.error} /><FormField label="Catalog Item" required hint="Search by item name, category, or description."><CatalogItemCombobox items={catalogItems} defaultValue={item?.catalog_item_id ?? ""} onSelectionChange={(catalogItem) => { if (catalogItem) setUnit(catalogItem.unit_type); }} /></FormField><div className="grid gap-5 sm:grid-cols-2"><FormField label="Quantity" required><Input name="quantity" type="number" min="0.01" step="0.01" inputMode="decimal" required defaultValue={item?.quantity ?? "1"} /></FormField><FormField label="Unit" required hint="Defaults from the catalog item; adjust if needed."><Input name="unit" required value={unit} onChange={(event) => setUnit(event.target.value)} /></FormField><FormField label="Item Type" required><Select name="item_type" defaultValue={item ? item.included ? "included" : "addon" : defaultType}><option value="included">Included Item</option><option value="addon">Optional Add-on</option></Select></FormField><FormField label="Price Override" hint="Optional. Leave blank to use the catalog price later."><Input name="price_override" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={item?.price_override ?? ""} /></FormField></div><FormField label="Notes"><Textarea name="notes" defaultValue={item?.notes ?? ""} placeholder="Included up to 125 ft, extra wreath upgrade…" /></FormField><div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"><LinkButton href={`/packages/${packageId}`} variant="secondary" size="lg">Cancel</LinkButton><Save editing={editing} /></div></form>; }
