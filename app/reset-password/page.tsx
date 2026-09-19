import Link from "next/link";
import { cookies } from "next/headers";
import { AuthCard } from "@/components/auth/auth-card";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/auth/password-recovery";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Set New Password" };

async function hasValidRecoverySession() {
  const cookieStore = await cookies();
  if (cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value !== "1") return false;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return !error && Boolean(user);
  } catch {
    return false;
  }
}

export default async function ResetPasswordPage() {
  const canResetPassword = await hasValidRecoverySession();

  return (
    <AuthCard
      eyebrow="Account recovery"
      title={canResetPassword ? "Set a new password" : "Recovery link expired"}
      description={canResetPassword ? "Choose a new password for your Holiday Light Pro account." : "This recovery session is invalid, expired, or has already been used."}
      footer={<>Return to <Link href="/login" className="font-semibold text-amber-300 hover:text-amber-200">Log In</Link></>}
    >
      {canResetPassword ? (
        <UpdatePasswordForm />
      ) : (
        <div className="space-y-5">
          <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-950">Request a new recovery email to continue securely.</div>
          <Link href="/forgot-password" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#0f4835] bg-[#14543d] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0d3f2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2">Request New Recovery Email</Link>
        </div>
      )}
    </AuthCard>
  );
}
