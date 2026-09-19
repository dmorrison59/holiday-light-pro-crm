import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";

export const metadata = { title: "Forgot Password" };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const invalidLink = params.error === "invalid-or-expired";

  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter the email address for your account and we’ll send a secure reset link."
      footer={<>Remembered your password? <Link href="/login" className="font-semibold text-amber-300 hover:text-amber-200">Log in</Link></>}
    >
      {invalidLink ? <div role="alert" className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-950">That recovery link is invalid, expired, or has already been used. Request a new email below.</div> : null}
      <PasswordRecoveryForm />
    </AuthCard>
  );
}
