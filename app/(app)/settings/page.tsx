import { DemoDataCard } from "@/components/settings/demo-data-card";
import { PricingSettingsCard } from "@/components/settings/pricing-settings-card";
import { PageHeader } from "@/components/ui/page-header";
import { requireOrganization } from "@/lib/auth/current";
import { getOrganizationPricingSettings } from "@/lib/organization-pricing";
export default async function SettingsPage() { const { organization } = await requireOrganization(); const settings = await getOrganizationPricingSettings(organization.id); return <div className="space-y-7"><PageHeader title="Settings" description="Manage pricing guidance, launch tools, and workspace preferences." /><div className="grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"><PricingSettingsCard settings={settings} /><DemoDataCard /></div></div>; }
