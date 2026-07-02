import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = { title: "Create Account" };

export default function SignupPage() {
  return <AuthCard eyebrow="Start your workspace" title="Create your account" description="Set up your login first. Your company details come next." footer={<>Already have an account? <Link href="/login" className="font-semibold text-amber-400 hover:text-amber-300">Log in</Link></>}><SignupForm /></AuthCard>;
}
