import { describe, expect, it } from "vitest";

import { isFetchableUrl } from "./url-safety";

const check = (value: string, blockedHosts?: Array<string>) =>
  isFetchableUrl(new URL(value), blockedHosts);

describe("isFetchableUrl", () => {
  it.each([
    "https://example.com",
    "http://example.com/path?q=1",
    "https://sub.example.co.uk",
    "http://8.8.8.8",
    "https://[2606:4700:4700::1111]",
  ])("allows public URL %s", (url) => {
    expect(check(url)).toBe(true);
  });

  it.each([
    "http://localhost",
    "http://localhost.",
    "http://app.localhost",
    "http://printer.local",
    "http://metadata.google.internal",
    "http://intranet",
    "http://127.0.0.1",
    "http://127.1",
    "http://2130706433",
    "http://0x7f000001",
    "http://0177.0.0.1",
    "http://0.0.0.0",
    "http://10.0.0.1",
    "http://172.16.5.4",
    "http://192.168.1.1",
    "http://169.254.169.254",
    "http://100.64.0.1",
    "http://224.0.0.1",
    "http://255.255.255.255",
    "http://[::1]",
    "http://[::]",
    "http://[::ffff:127.0.0.1]",
    "http://[::ffff:a9fe:a9fe]",
    "http://[64:ff9b::a9fe:a9fe]",
    "http://[fc00::1]",
    "http://[fd12:3456::1]",
    "http://[fe80::1]",
    "http://[ff02::1]",
    "http://[2001:db8::1]",
    "http://[2002:7f00:1::]",
  ])("blocks private or local URL %s", (url) => {
    expect(check(url)).toBe(false);
  });

  it.each([
    "ftp://example.com",
    "file:///etc/passwd",
    "https://example.com:8443",
    "https://user:pass@example.com",
  ])("blocks unsupported URL %s", (url) => {
    expect(check(url)).toBe(false);
  });

  it("allows an explicit default port", () => {
    expect(check("http://example.com:80/")).toBe(true);
  });

  it("blocks our own domains and their subdomains", () => {
    expect(check("https://pulse.dev", ["pulse.dev"])).toBe(false);
    expect(check("https://app.pulse.dev", ["pulse.dev"])).toBe(false);
    expect(check("https://notpulse.dev", ["pulse.dev"])).toBe(true);
  });
});
