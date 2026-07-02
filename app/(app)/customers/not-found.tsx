import { UserX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function CustomerNotFound() {
  return <EmptyState icon={<UserX className="size-5" />} title="Customer not found" description="This customer may have been deleted, or it does not belong to your company." actionLabel="Back to Customers" actionHref="/customers" />;
}
