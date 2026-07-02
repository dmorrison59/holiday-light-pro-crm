import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { getCurrentAuthContext } from "@/lib/auth/current";

export const metadata = { title: "Create Company" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { user, profile, organization } = await getCurrentAuthContext();
  if (!user) redirect("/login?error=Log%20in%20to%20finish%20setting%20up%20your%20company.");
  if (profile && organization) redirect("/dashboard");

  return (
    <AuthCard eyebrow="One last step" title="Create your company" description="This connects your account to the organization that owns its customers, quotes, and jobs.">
      <OnboardingForm firstName={String(user.user_metadata.first_name ?? "")} lastName={String(user.user_metadata.last_name ?? "")} userEmail={user.email ?? ""} />
    </AuthCard>
  );
}
