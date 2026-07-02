const getRequiredEnv = (name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") => {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.local.example to .env.local and add your Supabase project credentials.`,
    );
  }

  return value;
};

export function getSupabaseEnv() {
  return {
    url: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}
