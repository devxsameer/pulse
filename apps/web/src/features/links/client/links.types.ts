import type { listLinksFn } from "../server/links.functions";

export type LinksPage = Awaited<ReturnType<typeof listLinksFn>>;

export type LinkItem = LinksPage["items"][number];
