import { describe, expect, it } from "vitest";

import { isUniqueViolation } from "./errors";

describe("isUniqueViolation", () => {
  it("detects the Postgres code directly on the error", () => {
    expect(
      isUniqueViolation(Object.assign(new Error("dup"), { code: "23505" })),
    ).toBe(true);
  });

  it("detects the code on a wrapped cause", () => {
    const cause = Object.assign(new Error("dup"), { code: "23505" });
    expect(isUniqueViolation(new Error("query failed", { cause }))).toBe(true);
  });

  it("ignores other errors", () => {
    expect(
      isUniqueViolation(Object.assign(new Error("fk"), { code: "23503" })),
    ).toBe(false);
    expect(isUniqueViolation(new Error("boom"))).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
  });
});
