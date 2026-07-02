import { notFound } from "next/navigation";
import { PackageItemForm } from "@/components/packages/package-item-form";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getActiveCatalogItems } from "@/lib/measurements";
import { getPackage } from "@/lib/packages";
export default async function NewPackageItemPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string }> }) { const { organization } = await requireOrganization(); const { id } = await params; const query = await searchParams; const [packageRecord, catalogItems] = await Promise.all([getPackage(organization.id, id), getActiveCatalogItems(organization.id)]); if (!packageRecord) notFound(); const type = query.type === "addon" ? "addon" : "included"; return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title={type === "included" ? "Add Included Item" : "Add Optional Add-on"} description={`Choose an active catalog item for ${packageRecord.name}.`} />{catalogItems.length ? <Card><CardContent className="p-5 sm:p-7"><PackageItemForm packageId={id} catalogItems={catalogItems} defaultType={type} /></CardContent></Card> : <EmptyState title="Add catalog items first" description="Add catalog items before creating package items." actionLabel="Go to Catalog" actionHref="/catalog" />}</div>; }
