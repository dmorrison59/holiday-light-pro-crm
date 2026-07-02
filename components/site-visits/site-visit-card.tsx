import { CalendarDays, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { formatVisitDate, propertyAddress } from "@/lib/format";
import type { SiteVisitRecord } from "@/lib/site-visits";

export function SiteVisitCard({ visit, showProperty = true }: { visit: SiteVisitRecord; showProperty?: boolean }) {
  return <Card><CardContent className="space-y-4 p-4"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><CalendarDays className="size-5" /></span><div className="min-w-0"><h3 className="font-bold text-slate-950">{formatVisitDate(visit.visit_date)}</h3>{showProperty ? <p className="mt-1 text-sm text-slate-600">{visit.property.property_name || propertyAddress(visit.property)}</p> : null}<p className="mt-1 text-xs text-slate-500">{visit.preferred_style || "Style not selected"} · {visit.preferred_colors.join(", ") || "Colors not selected"}</p><p className="mt-1 text-xs text-slate-500">Budget: {visit.budget_discussed || "Not discussed"}</p></div></div><div className="grid grid-cols-2 gap-2"><LinkButton href={`/site-visits/${visit.id}`} variant="secondary">View Visit</LinkButton><LinkButton href={`/site-visits/${visit.id}/edit`} variant="ghost"><Pencil className="mr-2 size-4" />Edit</LinkButton></div></CardContent></Card>;
}
