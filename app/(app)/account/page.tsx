import { Building2, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";

export const metadata = { title: "Account" };

function Detail({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon: typeof Mail }) {
  return <div className="flex gap-3 rounded-xl bg-slate-50 p-4"><Icon className="mt-0.5 size-4 shrink-0 text-slate-500" /><div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{value || "Not provided"}</dd></div></div>;
}

export default async function AccountPage() {
  const { user, profile, organization } = await requireOrganization();
  return <div className="space-y-7"><PageHeader title="Account" description="Your login, team role, and company details." /><Card><CardContent className="grid gap-4 p-5 sm:grid-cols-2"><Detail label="User email" value={user.email} icon={Mail} /><Detail label="Name" value={[profile.first_name, profile.last_name].filter(Boolean).join(" ")} icon={UserRound} /><Detail label="Role" value={profile.role} icon={ShieldCheck} /><Detail label="Organization" value={organization.name} icon={Building2} /><Detail label="Company phone" value={organization.phone} icon={Building2} /><Detail label="Company email" value={organization.email} icon={Mail} /></CardContent></Card></div>;
}
