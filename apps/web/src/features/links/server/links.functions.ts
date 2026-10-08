import { createServerFn } from "@tanstack/react-start";

import { createLinkSchema } from "../schemas/create-link.schema";
import {
  fetchMetadataSchema,
  linkIdSchema,
  listLinksSchema,
  setLinkActiveSchema,
  updateLinkSchema,
} from "../schemas/manage-link.schema";
import {
  InvalidLinkError,
  LinkConflictError,
  LinkNotFoundError,
} from "../lib/errors";
import { EMPTY_METADATA } from "../lib/html-metadata";
import type { LinkMetadata } from "../lib/html-metadata";

import {
  createLink,
  deleteLink,
  listLinks,
  setLinkActive,
  updateLink,
} from "./links.service";
import { fetchLinkMetadata } from "./metadata.server";
import { allowMetadataFetch } from "./rate-limit.server";
import { requireWorkspace } from "#/features/auth/server/auth.server";
import { getServerEnv } from "#/lib/env";

// Only known domain errors reach the client verbatim; anything else is logged and generalized.
async function withUserErrors<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (
      error instanceof LinkConflictError ||
      error instanceof LinkNotFoundError ||
      error instanceof InvalidLinkError
    ) {
      throw new Error(error.message);
    }

    console.error(error);
    throw new Error("Something went wrong. Please try again.");
  }
}

export const createLinkFn = createServerFn({ method: "POST" })
  .validator(createLinkSchema)
  .handler(async ({ data }) => {
    const ctx = await requireWorkspace();

    return withUserErrors(() => createLink(ctx, data));
  });

export const listLinksFn = createServerFn({ method: "GET" })
  .validator(listLinksSchema)
  .handler(async ({ data }) => {
    const ctx = await requireWorkspace();

    return withUserErrors(() => listLinks(ctx, data));
  });

export const updateLinkFn = createServerFn({ method: "POST" })
  .validator(updateLinkSchema)
  .handler(async ({ data }) => {
    const ctx = await requireWorkspace();

    return withUserErrors(() => updateLink(ctx, data));
  });

export const setLinkActiveFn = createServerFn({ method: "POST" })
  .validator(setLinkActiveSchema)
  .handler(async ({ data }) => {
    const ctx = await requireWorkspace();

    return withUserErrors(() => setLinkActive(ctx, data));
  });

export const deleteLinkFn = createServerFn({ method: "POST" })
  .validator(linkIdSchema)
  .handler(async ({ data }) => {
    const ctx = await requireWorkspace();

    return withUserErrors(() => deleteLink(ctx, data.id));
  });

// Best-effort prefill: never throws for bad URLs, blocked hosts, or rate limits.
export const fetchMetadataFn = createServerFn({ method: "POST" })
  .validator(fetchMetadataSchema)
  .handler(async ({ data }): Promise<LinkMetadata> => {
    const ctx = await requireWorkspace();

    if (!(await allowMetadataFetch(ctx.userId))) return EMPTY_METADATA;

    return fetchLinkMetadata(data.url, {
      blockedHosts: [new URL(getServerEnv().BETTER_AUTH_URL).hostname],
    });
  });
