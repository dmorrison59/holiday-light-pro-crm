import { NextResponse, type NextRequest } from "next/server";
import {
  approvedCallbackPath,
  PASSWORD_RECOVERY_COOKIE,
  PASSWORD_RECOVERY_PATH,
  recoveryCookieOptions,
} from "@/lib/auth/password-recovery";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = approvedCallbackPath(searchParams.get("next"));
  const isRecovery = next === PASSWORD_RECOVERY_PATH;

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const response = NextResponse.redirect(`${origin}${next}`);
        if (isRecovery) {
          response.cookies.set(
            PASSWORD_RECOVERY_COOKIE,
            "1",
            recoveryCookieOptions(request.nextUrl.protocol === "https:"),
          );
        }
        return response;
      }
    } catch {
      // Use the fixed recovery/login messages below without exposing auth details.
    }
  }

  if (isRecovery) {
    return NextResponse.redirect(`${origin}/forgot-password?error=invalid-or-expired`);
  }

  return NextResponse.redirect(
    `${origin}/login?error=We%20could%20not%20confirm%20that%20account.%20Try%20logging%20in.`,
  );
}
