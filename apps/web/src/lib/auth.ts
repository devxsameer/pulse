import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { organization } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { getDb } from "#/db";
import { getServerEnv } from "#/lib/env";
import { resolveWorkspaceId } from "#/features/workspaces/server/workspaces.repository";

function createAuth() {
  const env = getServerEnv();

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.BETTER_AUTH_URL],
    database: drizzleAdapter(getDb(), { provider: "pg" }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session) => ({
            data: {
              ...session,
              activeOrganizationId: await resolveWorkspaceId(session.userId),
            },
          }),
        },
      },
    },
    experimental: { joins: true },
    plugins: [organization(), tanstackStartCookies()],
  });
}

export type Auth = ReturnType<typeof createAuth>;

let auth: Auth | undefined;

export function getAuth(): Auth {
  auth ??= createAuth();
  return auth;
}
