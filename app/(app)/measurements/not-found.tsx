import { Ruler } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
export default function MeasurementNotFound() { return <EmptyState icon={<Ruler className="size-5" />} title="Measurement not found" description="This measurement may have been deleted, or it does not belong to your company." actionLabel="Back to Site Visits" actionHref="/site-visits" />; }
