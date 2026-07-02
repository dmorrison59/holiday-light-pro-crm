import { notFound } from "next/navigation";
import { EventForm } from "@/components/schedule/event-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getScheduleEvent, getScheduleFormData } from "@/lib/schedule";
export default async function EditScheduleEventPage({ params }: { params: Promise<{ id: string }> }) { const { organization } = await requireOrganization(); const { id } = await params; const [event, data] = await Promise.all([getScheduleEvent(organization.id, id), getScheduleFormData(organization.id)]); if (!event) notFound(); return <div className="space-y-7"><PageHeader title="Edit Schedule Event" description="Update timing, status, assignment, and field notes." /><Card><CardContent className="p-5 sm:p-6"><EventForm data={data} event={event} /></CardContent></Card></div>; }
