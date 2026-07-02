import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const protectedPrefixes = [
  "/dashboard",
  "/leads",
  "/customers",
  "/properties",
  "/site-visits",
  "/measurements",
  "/jobs",
  "/quotes",
  "/schedule",
  "/catalog",
  "/packages",
  "/payments",
  "/settings",
  "/account",
];

const isProtectedPath = (pathname: string) =>
  protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

function redirectWithSession(url: URL, sessionResponse: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);

  sessionResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = sessionResponse.headers.get(header);
    if (value) redirectResponse.headers.set(header, value);
  }

  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Keep public setup screens usable before local credentials are configured.
  if (!url || !anonKey) {
    if (isProtectedPath(pathname) || pathname === "/onboarding") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "error",
        "Supabase is not configured yet. Add the values from .env.local.example.",
      );
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  // Keep this immediately after client creation so refresh cookies are preserved.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && (isProtectedPath(pathname) || pathname === "/onboarding")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return redirectWithSession(loginUrl, response);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return redirectWithSession(new URL("/dashboard", request.url), response);
  }

  return response;
}
