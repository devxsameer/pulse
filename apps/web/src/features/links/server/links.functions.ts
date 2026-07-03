import { createServerFn } from "@tanstack/react-start";

import { createLinkSchema } from "../schemas/create-link.schema";

import { createLink, getUserLinks } from "./links.service";
import { requireServerSession } from "#/features/auth/server/auth.guards";

export const createLinkFn = createServerFn({
  method: "POST",
})
  .validator(createLinkSchema)
  .handler(async ({ data }) => {
    const session = await requireServerSession();

    return createLink(session.user.id, data);
  });

export const getLinksFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const session = await requireServerSession();

  return getUserLinks(session.user.id);
});
