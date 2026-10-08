export type UnavailableReason = "not_found" | "disabled" | "expired";

const PAGES: Record<
  UnavailableReason,
  { status: number; title: string; message: string }
> = {
  not_found: {
    status: 404,
    title: "Link not found",
    message:
      "This short link doesn't exist or has been removed. Check the address and try again.",
  },
  disabled: {
    status: 410,
    title: "This link has been disabled",
    message: "The owner of this short link has turned it off.",
  },
  expired: {
    status: 410,
    title: "This link has expired",
    message: "This short link was only available for a limited time.",
  },
};

// Templates are fully static: no user-controlled content, so nothing needs escaping.
export function renderStatusPage(reason: UnavailableReason) {
  const { title, message } = PAGES[reason];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title} · Pulse</title>
<style>
:root{color-scheme:light dark;--bg:#fafafa;--fg:#0a0a0a;--muted:#6b7280;--card:#fff;--border:#e5e7eb;--accent:#4f46e5}
@media (prefers-color-scheme:dark){:root{--bg:#0a0a0a;--fg:#fafafa;--muted:#9ca3af;--card:#141414;--border:#262626;--accent:#818cf8}}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:420px;width:100%;text-align:center;background:var(--card);border:1px solid var(--border);border-radius:16px;padding:40px 32px}
.brand{font-weight:600;letter-spacing:-.01em;color:var(--muted);margin:0 0 24px}
h1{font-size:1.375rem;line-height:1.3;margin:0 0 8px}
p{color:var(--muted);margin:0 0 28px}
a{display:inline-block;color:#fff;background:var(--accent);text-decoration:none;font-weight:500;padding:10px 20px;border-radius:10px}
a:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
</style>
</head>
<body>
<main>
<p class="brand">Pulse</p>
<h1>${title}</h1>
<p>${message}</p>
<a href="/">Go to Pulse</a>
</main>
</body>
</html>`;
}

export function statusPageResponse(reason: UnavailableReason) {
  return new Response(renderStatusPage(reason), {
    status: PAGES[reason].status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
