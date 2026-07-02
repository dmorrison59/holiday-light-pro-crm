import { notFound } from "next/navigation";
import { MaterialForm } from "@/components/materials/material-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getJob } from "@/lib/jobs";
import { getMaterial, getMaterialFormData } from "@/lib/materials";
export default async function EditMaterialPage({ params }: { params: Promise<{ id: string; materialId: string }> }) { const { organization } = await requireOrganization(); const { id, materialId } = await params; const [job, material, catalog] = await Promise.all([getJob(organization.id, id), getMaterial(organization.id, id, materialId), getMaterialFormData(organization.id)]); if (!job || !material) notFound(); return <div className="space-y-7"><PageHeader title="Edit Material" description={material.description} /><Card><CardContent className="p-5 sm:p-6"><MaterialForm jobId={id} catalog={catalog} material={material} /></CardContent></Card></div>; }
