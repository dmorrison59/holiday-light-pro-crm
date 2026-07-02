import { notFound } from "next/navigation";
import { PackageForm } from "@/components/packages/package-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getPackage } from "@/lib/packages";
export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) { const { organization } = await requireOrganization(); const { id } = await params; const packageRecord = await getPackage(organization.id, id); if (!packageRecord) notFound(); return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title={`Edit ${packageRecord.name}`} description="Update pricing, budget guidance, and package presentation." /><Card><CardContent className="p-5 sm:p-7"><PackageForm packageRecord={packageRecord} /></CardContent></Card></div>; }
