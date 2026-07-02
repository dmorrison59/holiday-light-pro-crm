import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Log In" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  return (
    <AuthCard eyebrow="Welcome back" title="Log in to your workspace" description="Pick up where you left off and keep the season moving." footer={<>Need an account? <Link href="/signup" className="font-semibold text-amber-400 hover:text-amber-300">Sign up</Link></>}>
      {params.error ? <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{params.error}</div> : null}
      {params.message ? <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{params.message}</div> : null}
      <LoginForm />
    </AuthCard>
  );
}
