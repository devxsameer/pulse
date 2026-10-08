import { env } from "cloudflare:workers";

// Fails open when the binding is absent: the limit only guards a best-effort prefill.
export async function allowMetadataFetch(userId: string) {
  const limiter = env.METADATA_RATE_LIMITER;
  if (!limiter) return true;

  try {
    const { success } = await limiter.limit({ key: userId });
    return success;
  } catch {
    return true;
  }
}
