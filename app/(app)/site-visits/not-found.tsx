import { CalendarX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
export default function SiteVisitNotFound() { return <EmptyState icon={<CalendarX className="size-5" />} title="Site visit not found" description="This visit may have been removed, or it does not belong to your company." actionLabel="Back to Site Visits" actionHref="/site-visits" />; }
