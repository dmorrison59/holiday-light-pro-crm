import { notFound } from "next/navigation";
import { QuoteBuilder } from "@/components/quotes/quote-builder";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getQuote, getQuoteBuilderData } from "@/lib/quotes";
export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) { const { organization } = await requireOrganization(); const { id } = await params; const [quote, data] = await Promise.all([getQuote(organization.id, id), getQuoteBuilderData(organization.id)]); if (!quote) notFound(); return <div className="space-y-7"><PageHeader title={`Edit ${quote.quote_number}`} description="Update selections, line items, pricing, deposits, and notes." /><QuoteBuilder data={data} quote={quote} /></div>; }
