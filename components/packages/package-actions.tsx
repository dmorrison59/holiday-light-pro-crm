"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Archive, Power, Sparkles, Trash2, X } from "lucide-react";
import { deletePackageAction, loadStarterPackagesAction, removePackageItemAction, togglePackageAction } from "@/app/actions/packages";
import { FormMessage } from "@/components/auth/form-fields";
import { Button } from "@/components/ui/button";

function Submit({ label, pendingLabel, variant = "secondary", icon: Icon }: { label: string; pendingLabel: string; variant?: "primary" | "secondary" | "danger" | "ghost"; icon: typeof Power }) { const { pending } = useFormStatus(); return <Button type="submit" variant={variant} disabled={pending}><Icon className="mr-2 size-4" />{pending ? pendingLabel : label}</Button>; }
export function PackageStatusForm({ packageId, active }: { packageId: string; active: boolean }) { const [state, action] = useActionState(togglePackageAction, {}); return <form action={action} className="space-y-2"><input type="hidden" name="package_id" value={packageId} /><FormMessage error={state.error} /><Submit label={active ? "Deactivate" : "Reactivate"} pendingLabel="Updating…" icon={active ? Archive : Power} /></form>; }
export function DeletePackageForm({ packageId, name }: { packageId: string; name: string }) { const [state, action] = useActionState(deletePackageAction, {}); return <form action={action} onSubmit={(event) => { if (!window.confirm(`Delete ${name}? Deactivate it instead if it has been used.`)) event.preventDefault(); }} className="space-y-2"><input type="hidden" name="package_id" value={packageId} /><FormMessage error={state.error} /><Submit label="Delete Package" pendingLabel="Deleting…" variant="danger" icon={Trash2} /></form>; }
export function RemovePackageItemForm({ packageId, itemId }: { packageId: string; itemId: string }) { const [state, action] = useActionState(removePackageItemAction, {}); return <form action={action} onSubmit={(event) => { if (!window.confirm("Remove this item from the package?")) event.preventDefault(); }} className="space-y-2"><input type="hidden" name="package_id" value={packageId} /><input type="hidden" name="package_item_id" value={itemId} /><FormMessage error={state.error} /><Submit label="Remove" pendingLabel="Removing…" variant="ghost" icon={X} /></form>; }
export function StarterPackagesForm() { const [state, action] = useActionState(loadStarterPackagesAction, {}); return <form action={action} className="space-y-2"><FormMessage error={state.error} /><Submit label="Load Starter Packages" pendingLabel="Loading packages…" variant="secondary" icon={Sparkles} /></form>; }
