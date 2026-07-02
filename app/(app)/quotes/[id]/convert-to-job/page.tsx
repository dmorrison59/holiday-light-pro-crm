import { notFound } from "next/navigation";
import { JobForm } from "@/components/jobs/job-form";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getJobForQuote } from "@/lib/jobs";
import { getQuote } from "@/lib/quotes";
export default async function ConvertToJobPage({ params }: { params: Promise<{ id: string }> }) { const { organization } = await requireOrganization(); const { id } = await params; const [quote, existingJob] = await Promise.all([getQuote(organization.id, id), getJobForQuote(organization.id, id)]); if (!quote) notFound(); if (existingJob) return <EmptyState title="Job already created" description="This quote has already been converted into an installation job." actionLabel="View Job" actionHref={`/jobs/${existingJob.id}`} />; if (quote.status !== "approved") return <EmptyState title="Quote approval required" description="Quote must be approved before converting to a job." action={<LinkButton href={`/quotes/${id}`}>Back to Quote</LinkButton>} />; return <div className="mx-auto max-w-5xl space-y-7"><PageHeader title="Convert to Job" description="Schedule the approved work and prepare crew, materials, and storage notes." /><Card><CardContent className="p-5 sm:p-7"><JobForm quote={quote} /></CardContent></Card></div>; }
