import { notFound } from "next/navigation";
import { PaymentForm } from "@/components/payments/payment-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getJob } from "@/lib/jobs";
import { getPaymentsForJob } from "@/lib/payments";
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
export default async function NewPaymentPage({ params }: { params: Promise<{ id: string }> }) { const { organization } = await requireOrganization(); const { id } = await params; const job = await getJob(organization.id, id); if (!job?.quote) notFound(); const summary = await getPaymentsForJob(organization.id, id, job.quote.total); const deposit = Number(job.quote.deposit_required); const hasPayments = summary.payments.length > 0; const defaultType = hasPayments || summary.totalPaid >= deposit ? "final_balance" : "deposit"; const defaultAmount = defaultType === "deposit" ? Math.min(deposit || summary.remainingBalance, summary.remainingBalance) : summary.remainingBalance; return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title="Record Payment" description={`${job.job_number} · ${money(summary.remainingBalance)} remaining`} /><Card><CardContent className="p-5 sm:p-7"><PaymentForm jobId={id} defaultType={defaultType} defaultAmount={defaultAmount} /></CardContent></Card></div>; }
