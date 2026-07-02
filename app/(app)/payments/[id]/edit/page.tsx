import { notFound } from "next/navigation";
import { PaymentForm } from "@/components/payments/payment-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getPayment } from "@/lib/payments";
export default async function EditPaymentPage({ params }: { params: Promise<{ id: string }> }) { const { organization } = await requireOrganization(); const { id } = await params; const payment = await getPayment(organization.id, id); if (!payment?.job_id) notFound(); return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title="Edit Payment" description="Update the amount, method, status, reference, or notes." /><Card><CardContent className="p-5 sm:p-7"><PaymentForm jobId={payment.job_id} payment={payment} defaultType={payment.payment_type} defaultAmount={Number(payment.amount)} /></CardContent></Card></div>; }
