import { notFound } from "next/navigation";
import { PackageItemForm } from "@/components/packages/package-item-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getActiveCatalogItems } from "@/lib/measurements";
import { getPackageItem } from "@/lib/packages";
export default async function EditPackageItemPage({ params }: { params: Promise<{ id: string; itemId: string }> }) { const { organization } = await requireOrganization(); const { id, itemId } = await params; const [result, catalogItems] = await Promise.all([getPackageItem(organization.id, id, itemId), getActiveCatalogItems(organization.id)]); if (!result?.item) notFound(); return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title={`Edit ${result.item.catalog_item.name}`} description={`Update this item in ${result.packageRecord.name}.`} /><Card><CardContent className="p-5 sm:p-7"><PackageItemForm packageId={id} catalogItems={catalogItems} item={result.item} /></CardContent></Card></div>; }
