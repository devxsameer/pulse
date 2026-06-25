import { createServerFn } from "@tanstack/react-start";
import { getServerSession } from "./auth.server";
import { getRequest } from "@tanstack/react-start/server";

export const getSession = createServerFn().handler(async () => {
  const request = getRequest();
  return getServerSession(request);
});
