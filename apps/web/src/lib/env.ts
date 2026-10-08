import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

// Read lazily: on Workers, env is only guaranteed inside a request context.
export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const keys = result.error.issues.map((issue) => issue.path.join("."));
    throw new Error(`Invalid server environment: ${keys.join(", ")}`);
  }

  cached = result.data;
  return cached;
}
