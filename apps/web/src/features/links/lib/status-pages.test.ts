import { describe, expect, it } from "vitest";

import { renderStatusPage, statusPageResponse } from "./status-pages";

describe("statusPageResponse", () => {
  it.each([
    ["not_found", 404, "Link not found"],
    ["disabled", 410, "This link has been disabled"],
    ["expired", 410, "This link has expired"],
  ] as const)("renders %s as %i", async (reason, status, title) => {
    const response = statusPageResponse(reason);

    expect(response.status).toBe(status);
    expect(response.headers.get("Content-Type")).toBe(
      "text/html; charset=utf-8",
    );
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
    expect(await response.text()).toContain(`<h1>${title}</h1>`);
  });

  it("ships no JavaScript", () => {
    expect(renderStatusPage("not_found")).not.toContain("<script");
  });
});
