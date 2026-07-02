import { DemoDataCard } from "@/components/settings/demo-data-card";
import { PageHeader } from "@/components/ui/page-header";
export default function SettingsPage() { return <div className="space-y-7"><PageHeader title="Settings" description="Manage launch tools and workspace preferences." /><div className="max-w-3xl"><DemoDataCard /></div></div>; }
