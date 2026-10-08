import { describe, expect, it } from "vitest";

import { parseHtmlMetadata } from "./html-metadata";

const pageUrl = new URL("https://example.com/blog/post");

describe("parseHtmlMetadata", () => {
  it("prefers Open Graph tags and resolves relative URLs", () => {
    const html = `<!doctype html><html><head>
      <title>Fallback title</title>
      <meta property="og:title" content="  Launch   day &amp; more ">
      <meta name="description" content="Plain description">
      <meta property="og:description" content='OG description'>
      <meta property="og:image" content="/img/cover.png">
      <link rel="shortcut icon" href="/static/favicon.png">
    </head><body><title>Not this</title></body></html>`;

    expect(parseHtmlMetadata(html, pageUrl)).toEqual({
      title: "Launch day & more",
      description: "OG description",
      imageUrl: "https://example.com/img/cover.png",
      faviconUrl: "https://example.com/static/favicon.png",
    });
  });

  it("falls back to <title>, description, twitter:image, and /favicon.ico", () => {
    const html = `<head>
      <title>Hello &#x2014; world</title>
      <meta content="A description" name="Description">
      <meta name="twitter:image" content="https://cdn.example.com/t.jpg">
    </head>`;

    expect(parseHtmlMetadata(html, pageUrl)).toEqual({
      title: "Hello — world",
      description: "A description",
      imageUrl: "https://cdn.example.com/t.jpg",
      faviconUrl: "https://example.com/favicon.ico",
    });
  });

  it("drops non-https assets", () => {
    const html = `<head>
      <meta property="og:image" content="http://example.com/cover.png">
      <link rel="icon" href="javascript:alert(1)">
    </head>`;

    const metadata = parseHtmlMetadata(html, new URL("http://example.com"));

    expect(metadata.imageUrl).toBeNull();
    expect(metadata.faviconUrl).toBeNull();
  });

  it("ignores tags inside comments and scripts", () => {
    const html = `<head>
      <!-- <title>Commented</title> -->
      <script>document.write("<title>Scripted</title>")</script>
      <title>Real</title>
    </head>`;

    expect(parseHtmlMetadata(html, pageUrl).title).toBe("Real");
  });

  it("respects <base href>", () => {
    const html = `<head>
      <base href="https://cdn.example.net/assets/">
      <link rel="icon" href="icon.svg">
    </head>`;

    expect(parseHtmlMetadata(html, pageUrl).faviconUrl).toBe(
      "https://cdn.example.net/assets/icon.svg",
    );
  });

  it("caps long titles", () => {
    const html = `<title>${"a".repeat(300)}</title>`;
    const title = parseHtmlMetadata(html, pageUrl).title;

    expect(title).toHaveLength(120);
    expect(title?.endsWith("…")).toBe(true);
  });

  it("returns nulls for an empty document", () => {
    expect(parseHtmlMetadata("", pageUrl)).toEqual({
      title: null,
      description: null,
      imageUrl: null,
      faviconUrl: "https://example.com/favicon.ico",
    });
  });
});
