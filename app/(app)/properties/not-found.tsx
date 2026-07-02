import { MapPinOff } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function PropertyNotFound() {
  return <EmptyState icon={<MapPinOff className="size-5" />} title="Property not found" description="This property may have been removed, or it does not belong to your company." actionLabel="Back to Customers" actionHref="/customers" />;
}
