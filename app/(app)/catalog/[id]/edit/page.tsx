import { notFound } from "next/navigation";
import { CatalogItemForm } from "@/components/catalog/catalog-item-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getCatalogItem } from "@/lib/catalog";
export default async function EditCatalogItemPage({ params }: { params: Promise<{ id: string }> }) { const { organization } = await requireOrganization(); const { id } = await params; const item = await getCatalogItem(organization.id, id); if (!item) notFound(); return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title={`Edit ${item.name}`} description="Update pricing, visibility, and inventory details." /><Card><CardContent className="p-5 sm:p-7"><CatalogItemForm item={item} /></CardContent></Card></div>; }
