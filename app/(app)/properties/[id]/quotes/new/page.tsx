import { NewQuotePage } from "@/components/quotes/new-quote-page";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <NewQuotePage propertyId={id} />; }
