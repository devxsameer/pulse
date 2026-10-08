import { describe, expect, it } from "vitest";

import {
  GENERATED_SHORT_CODE_LENGTH,
  generateShortCode,
  isReservedShortCode,
  validateCustomShortCode,
} from "./short-code";

describe("generateShortCode", () => {
  it("produces lowercase alphanumeric codes of the configured length", () => {
    for (let i = 0; i < 1000; i++) {
      expect(generateShortCode()).toMatch(
        new RegExp(`^[0-9a-z]{${GENERATED_SHORT_CODE_LENGTH}}$`),
      );
    }
  });

  it("produces distinct codes", () => {
    const codes = new Set(Array.from({ length: 1000 }, generateShortCode));
    expect(codes.size).toBe(1000);
  });
});

describe("isReservedShortCode", () => {
  it("matches reserved words case-insensitively", () => {
    expect(isReservedShortCode("dashboard")).toBe(true);
    expect(isReservedShortCode("DashBoard")).toBe(true);
    expect(isReservedShortCode("my-launch")).toBe(false);
  });
});

describe("validateCustomShortCode", () => {
  it.each(["abc", "My-Launch", "launch_2026", "a".repeat(64)])(
    "accepts %s",
    (code) => {
      expect(validateCustomShortCode(code)).toEqual({ ok: true });
    },
  );

  it.each([
    ["ab", "length"],
    ["a".repeat(65), "length"],
    ["-launch", "format"],
    ["_launch", "format"],
    ["has space", "format"],
    ["emoji🚀", "format"],
    ["../etc", "format"],
    ["api", "reserved"],
    ["Login", "reserved"],
  ] as const)("rejects %s (%s)", (code, reason) => {
    expect(validateCustomShortCode(code)).toEqual({ ok: false, reason });
  });
});
