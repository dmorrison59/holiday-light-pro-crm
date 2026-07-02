import { notFound } from "next/navigation";
import { MaterialForm } from "@/components/materials/material-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getJob } from "@/lib/jobs";
import { getMaterialFormData } from "@/lib/materials";
export default async function NewMaterialPage({ params }: { params: Promise<{ id: string }> }) { const { organization } = await requireOrganization(); const { id } = await params; const [job, catalog] = await Promise.all([getJob(organization.id, id), getMaterialFormData(organization.id)]); if (!job) notFound(); return <div className="space-y-7"><PageHeader title="Add Job Material" description={`Add a manual material to ${job.job_number || "this job"}.`} /><Card><CardContent className="p-5 sm:p-6"><MaterialForm jobId={id} catalog={catalog} /></CardContent></Card></div>; }
