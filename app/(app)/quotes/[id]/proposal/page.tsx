import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { CopyProposalLink, MarkProposalSentForm, PrintProposalButton } from "@/components/proposals/proposal-controls";
import { ProposalDocument } from "@/components/proposals/proposal-document";
import { LinkButton } from "@/components/ui/link-button";
import { requireOrganization } from "@/lib/auth/current";
import { getProposalForQuote } from "@/lib/proposals";

export const metadata = { title: "Proposal Preview" };

export default async function ProposalPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { organization } = await requireOrganization();
  const { id } = await params;
  const proposal = await getProposalForQuote(organization.id, id);
  if (!proposal?.quote.proposal_token) notFound();

  return <div className="space-y-6">
    <div data-print-hide className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="font-bold text-slate-950">Authenticated proposal preview</p><p className="mt-1 text-sm text-slate-500">Customer views do not include internal notes or private pricing data.</p></div>
      <div className="flex flex-wrap gap-2"><LinkButton href={`/quotes/${id}`} variant="ghost"><ArrowLeft className="mr-2 size-4" />Back to Quote</LinkButton><PrintProposalButton /><LinkButton href={`/proposal/${proposal.quote.proposal_token}`} variant="secondary"><ExternalLink className="mr-2 size-4" />Open Customer Link</LinkButton><MarkProposalSentForm quoteId={id} /></div>
    </div>
    <div data-print-hide className="rounded-2xl border border-slate-200 bg-white p-4"><p className="mb-2 text-sm font-bold text-slate-900">Share proposal</p><CopyProposalLink token={proposal.quote.proposal_token} /></div>
    <ProposalDocument proposal={proposal} />
  </div>;
}
