"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Archive, Power, Sparkles, Trash2 } from "lucide-react";
import { deleteCatalogItemAction, loadStarterCatalogAction, toggleCatalogItemAction } from "@/app/actions/catalog";
import { FormMessage } from "@/components/auth/form-fields";
import { Button } from "@/components/ui/button";

function Submit({ label, pendingLabel, variant = "secondary", icon: Icon }: { label: string; pendingLabel: string; variant?: "primary" | "secondary" | "danger"; icon: typeof Power }) { const { pending } = useFormStatus(); return <Button type="submit" variant={variant} disabled={pending}><Icon className="mr-2 size-4" />{pending ? pendingLabel : label}</Button>; }

export function CatalogStatusForm({ itemId, active }: { itemId: string; active: boolean }) { const [state, action] = useActionState(toggleCatalogItemAction, {}); return <form action={action} className="space-y-2"><input type="hidden" name="catalog_item_id" value={itemId} /><FormMessage error={state.error} /><Submit label={active ? "Deactivate" : "Reactivate"} pendingLabel="Updating…" icon={active ? Archive : Power} /></form>; }
export function DeleteCatalogItemForm({ itemId, itemName }: { itemId: string; itemName: string }) { const [state, action] = useActionState(deleteCatalogItemAction, {}); return <form action={action} onSubmit={(event) => { if (!window.confirm(`Delete ${itemName}? Deactivate it instead if it has ever been used.`)) event.preventDefault(); }} className="space-y-2"><input type="hidden" name="catalog_item_id" value={itemId} /><FormMessage error={state.error} /><Submit label="Delete Item" pendingLabel="Deleting…" variant="danger" icon={Trash2} /></form>; }
export function StarterCatalogForm() { const [state, action] = useActionState(loadStarterCatalogAction, {}); return <form action={action} className="space-y-2"><FormMessage error={state.error} /><Submit label="Load Starter Catalog" pendingLabel="Loading catalog…" variant="primary" icon={Sparkles} /></form>; }
