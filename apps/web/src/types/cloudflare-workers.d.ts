// Minimal typings for the Worker bindings we use; keep in sync with wrangler.jsonc.
// (Full `wrangler types` runtime typings conflict with the DOM lib this app also needs.)
declare module "cloudflare:workers" {
  interface RateLimit {
    limit: (options: { key: string }) => Promise<{ success: boolean }>;
  }

  export const env: {
    METADATA_RATE_LIMITER?: RateLimit;
  };
}
