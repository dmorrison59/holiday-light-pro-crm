import { EventForm } from "@/components/schedule/event-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getScheduleFormData } from "@/lib/schedule";
export default async function NewScheduleEventPage() { const { organization } = await requireOrganization(); const data = await getScheduleFormData(organization.id); return <div className="space-y-7"><PageHeader title="Add Schedule Event" description="Schedule a service call, follow-up, maintenance visit, or other field activity." /><Card><CardContent className="p-5 sm:p-6"><EventForm data={data} /></CardContent></Card></div>; }
