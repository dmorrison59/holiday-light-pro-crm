import { AppShell } from "@/components/app-shell";
import { requireOrganization } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, organization } = await requireOrganization();

  return (
    <AppShell organizationName={organization.name} userEmail={user.email ?? "Signed in"}>
      {children}
    </AppShell>
  );
}
