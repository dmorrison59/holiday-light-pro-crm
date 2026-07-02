import { NewQuotePage } from "@/components/quotes/new-quote-page";
export const metadata = { title: "Create Quote" };
export default async function Page({ searchParams }: { searchParams: Promise<{ customer_id?: string; property_id?: string; site_visit_id?: string }> }) { const query = await searchParams; return <NewQuotePage customerId={query.customer_id} propertyId={query.property_id} siteVisitId={query.site_visit_id} />; }
