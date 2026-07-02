import { ListPlus } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata = { title: "Leads" };

export default function LeadsPage() {
  return <PlaceholderPage title="Leads" description="Track new inquiries before they become customers." icon={ListPlus} emptyTitle="No leads yet" emptyDescription="Add your first lead when a homeowner or business asks about holiday lighting." actionLabel="Add Lead" actionHref="/leads" />;
}
