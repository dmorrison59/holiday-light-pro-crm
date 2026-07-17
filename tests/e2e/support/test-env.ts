import fs from "node:fs";
import path from "node:path";

let loaded = false;

export function loadTestEnvironment() {
  if (loaded) return;
  loaded = true;
  const file = path.join(process.cwd(), ".env.test.local");
  if (!fs.existsSync(file)) return;
  for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const name = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[name] === undefined) process.env[name] = value;
  }
}

export function requiredTestEnvironment() {
  loadTestEnvironment();
  const names = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "E2E_TEST_EMAIL_DOMAIN"] as const;
  const missing = names.filter((name) => !process.env[name]?.trim());
  if (missing.length) throw new Error(`Missing test environment variables: ${missing.join(", ")}. Add them to .env.test.local; never put the service-role key in a NEXT_PUBLIC_ variable.`);
  return {
    supabaseUrl: process.env.SUPABASE_URL!.trim(),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
    emailDomain: process.env.E2E_TEST_EMAIL_DOMAIN!.trim().toLowerCase(),
  };
}
