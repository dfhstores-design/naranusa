const SESSION_TOKEN_KEY = "naranusa-session-token";

export function readSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveSessionToken(token: string): void {
  window.sessionStorage.setItem(SESSION_TOKEN_KEY, token);
}

export function clearSessionToken(): void {
  try {
    window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // Storage may be unavailable in a restricted browser; the server token still expires.
  }
}
