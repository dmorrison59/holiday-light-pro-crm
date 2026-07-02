import { notFound } from "next/navigation";
import { JobForm } from "@/components/jobs/job-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getJob } from "@/lib/jobs";
import { getQuote } from "@/lib/quotes";
export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) { const { organization } = await requireOrganization(); const { id } = await params; const job = await getJob(organization.id, id); if (!job?.quote_id) notFound(); const quote = await getQuote(organization.id, job.quote_id); if (!quote) notFound(); return <div className="mx-auto max-w-5xl space-y-7"><PageHeader title={`Edit ${job.job_number}`} description="Update schedule, payment tracking, job status, and field notes." /><Card><CardContent className="p-5 sm:p-7"><JobForm quote={quote} job={job} /></CardContent></Card></div>; }
