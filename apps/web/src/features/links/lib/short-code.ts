import { customAlphabet } from "nanoid";

// Codes resolve case-insensitively, so generated codes are lowercase-only:
// 36^7 ≈ 7.8e10 combinations.
const GENERATED_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
export const GENERATED_SHORT_CODE_LENGTH = 7;

export const CUSTOM_SHORT_CODE_MIN_LENGTH = 3;
export const CUSTOM_SHORT_CODE_MAX_LENGTH = 64;
export const CUSTOM_SHORT_CODE_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

// Paths the app or the short domain needs for itself.
export const RESERVED_SHORT_CODES: ReadonlySet<string> = new Set([
  "about",
  "account",
  "admin",
  "ai-insights",
  "analytics",
  "api",
  "app",
  "assets",
  "auth",
  "billing",
  "blog",
  "callback",
  "dashboard",
  "docs",
  "favicon.ico",
  "health",
  "healthz",
  "help",
  "links",
  "login",
  "logout",
  "mcp",
  "pricing",
  "privacy",
  "qr-codes",
  "r",
  "robots.txt",
  "settings",
  "signin",
  "signup",
  "static",
  "status",
  "support",
  "terms",
  "www",
]);

const generate = customAlphabet(
  GENERATED_ALPHABET,
  GENERATED_SHORT_CODE_LENGTH,
);

export function generateShortCode() {
  return generate();
}

export function isReservedShortCode(code: string) {
  return RESERVED_SHORT_CODES.has(code.toLowerCase());
}

export type ShortCodeValidation =
  | { ok: true }
  | { ok: false; reason: "length" | "format" | "reserved" };

export function validateCustomShortCode(code: string): ShortCodeValidation {
  if (
    code.length < CUSTOM_SHORT_CODE_MIN_LENGTH ||
    code.length > CUSTOM_SHORT_CODE_MAX_LENGTH
  ) {
    return { ok: false, reason: "length" };
  }

  if (!CUSTOM_SHORT_CODE_PATTERN.test(code)) {
    return { ok: false, reason: "format" };
  }

  if (isReservedShortCode(code)) {
    return { ok: false, reason: "reserved" };
  }

  return { ok: true };
}
