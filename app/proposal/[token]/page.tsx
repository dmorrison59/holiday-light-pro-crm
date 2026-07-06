import { ProposalDocument } from "@/components/proposals/proposal-document";
import { PrintProposalButton } from "@/components/proposals/proposal-controls";
import { getPublicProposal } from "@/lib/proposals";
export const dynamic = "force-dynamic";
export const metadata = { title: "Christmas Light Installation Proposal" };
export default async function PublicProposalPage({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; const proposal = await getPublicProposal(token); if (!proposal) return <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5"><div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm"><h1 className="text-xl font-bold text-slate-950">Proposal not found.</h1><p className="mt-3 text-sm leading-6 text-slate-600">This proposal is no longer available. Please contact the installer.</p></div></main>; return <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6"><div data-print-hide className="mx-auto mb-4 flex max-w-5xl justify-end"><PrintProposalButton /></div><ProposalDocument proposal={proposal} publicView /></main>; }
