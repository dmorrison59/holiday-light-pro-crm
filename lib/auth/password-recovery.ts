import "server-only";

export const PASSWORD_RECOVERY_PATH = "/reset-password";
export const PASSWORD_RECOVERY_COOKIE = "hlp-password-recovery";
export const PASSWORD_RECOVERY_MAX_AGE = 30 * 60;

const PRODUCTION_ORIGIN = "https://www.holidaylightsprocrm.com";
const LOCAL_ORIGIN = "http://localhost:3000";
const allowedOrigins = new Set([PRODUCTION_ORIGIN, LOCAL_ORIGIN]);
const allowedCallbackPaths = new Set(["/onboarding", PASSWORD_RECOVERY_PATH]);

export function approvedAuthOrigin(requestOrigin: string | null) {
  if (requestOrigin && allowedOrigins.has(requestOrigin)) return requestOrigin;
  return process.env.NODE_ENV === "production" ? PRODUCTION_ORIGIN : LOCAL_ORIGIN;
}

export function approvedCallbackPath(requestedPath: string | null) {
  return requestedPath && allowedCallbackPaths.has(requestedPath)
    ? requestedPath
    : "/onboarding";
}

export function passwordRecoveryCallbackUrl(origin: string) {
  return `${origin}/auth/callback?next=/reset-password`;
}

export function recoveryCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    maxAge: PASSWORD_RECOVERY_MAX_AGE,
    path: "/",
    sameSite: "lax" as const,
    secure,
  };
}
