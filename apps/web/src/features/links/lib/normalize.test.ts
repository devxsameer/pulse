import { describe, expect, it } from "vitest";

import { InvalidLinkError } from "./errors";
import {
  normalizeDestinationUrl,
  normalizeExpiration,
  normalizeOptionalText,
} from "./normalize";

describe("normalizeDestinationUrl", () => {
  it("accepts http and https URLs", () => {
    expect(normalizeDestinationUrl("https://example.com")).toBe(
      "https://example.com/",
    );
    expect(normalizeDestinationUrl("  http://example.com/a?b=1  ")).toBe(
      "http://example.com/a?b=1",
    );
  });

  it.each(["javascript:alert(1)", "data:text/html,hi", "ftp://x.dev", "nope"])(
    "rejects %s",
    (value) => {
      expect(() => normalizeDestinationUrl(value)).toThrow(InvalidLinkError);
    },
  );
});

describe("normalizeOptionalText", () => {
  it("trims and maps empty to null", () => {
    expect(normalizeOptionalText("  hi  ")).toBe("hi");
    expect(normalizeOptionalText("   ")).toBeNull();
  });
});

describe("normalizeExpiration", () => {
  const now = new Date("2026-01-01T00:00:00Z");

  it("returns null when empty", () => {
    expect(normalizeExpiration("", now)).toBeNull();
  });

  it("parses future dates", () => {
    expect(normalizeExpiration("2026-02-01T00:00:00Z", now)).toEqual(
      new Date("2026-02-01T00:00:00Z"),
    );
  });

  it.each(["2025-12-31T23:59:59Z", "2026-01-01T00:00:00Z", "not-a-date"])(
    "rejects %s",
    (value) => {
      expect(() => normalizeExpiration(value, now)).toThrow(InvalidLinkError);
    },
  );
});
