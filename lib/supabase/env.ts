const requirePublicEnv = (value: string | undefined, name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") => {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.local.example to .env.local and add your Supabase project credentials.`,
    );
  }

  return value;
};

export function getSupabaseEnv() {
  return {
    // NEXT_PUBLIC variables must use direct property access so Next.js can
    // replace them in browser bundles at build time.
    url: requirePublicEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: requirePublicEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}
