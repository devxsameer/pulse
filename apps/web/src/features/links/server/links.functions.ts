import { createServerFn } from "@tanstack/react-start";

import { createLinkSchema } from "../schemas/create-link.schema";

import { createLink, getWorkspaceLinks } from "./links.service";
import { requireWorkspace } from "#/features/auth/server/auth.server";

export const createLinkFn = createServerFn({
  method: "POST",
})
  .validator(createLinkSchema)
  .handler(async ({ data }) => {
    const ctx = await requireWorkspace();

    return createLink(ctx, data);
  });

export const getLinksFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const ctx = await requireWorkspace();

  return getWorkspaceLinks(ctx);
});
