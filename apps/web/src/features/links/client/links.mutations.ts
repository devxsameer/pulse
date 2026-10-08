import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import { getLinkStatus } from "../lib/link-status";
import type { CreateLinkInput } from "../schemas/create-link.schema";
import type {
  SetLinkActiveInput,
  UpdateLinkInput,
} from "../schemas/manage-link.schema";

import {
  createLinkFn,
  deleteLinkFn,
  setLinkActiveFn,
  updateLinkFn,
} from "../server/links.functions";
import { linkKeys } from "./links.queries";
import type { LinkItem, LinksPage } from "./links.types";

type LinksData = InfiniteData<LinksPage, string | undefined>;

function invalidateLinks(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: linkKeys.all });
}

// Applies `update` to every cached links list and returns a rollback.
async function patchCachedLinks(
  queryClient: QueryClient,
  update: (items: Array<LinkItem>) => Array<LinkItem>,
) {
  await queryClient.cancelQueries({ queryKey: linkKeys.lists() });

  const snapshot = queryClient.getQueriesData<LinksData>({
    queryKey: linkKeys.lists(),
  });

  queryClient.setQueriesData<LinksData>(
    { queryKey: linkKeys.lists() },
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: update(page.items),
        })),
      },
  );

  return () => {
    for (const [key, data] of snapshot) {
      queryClient.setQueryData(key, data);
    }
  };
}

export function useCreateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLinkInput) => createLinkFn({ data: input }),

    onSettled: () => invalidateLinks(queryClient),
  });
}

export function useUpdateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateLinkInput) => updateLinkFn({ data: input }),

    onSettled: () => invalidateLinks(queryClient),
  });
}

export function useSetLinkActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SetLinkActiveInput) => setLinkActiveFn({ data: input }),

    onMutate: async ({ id, isActive }) => ({
      rollback: await patchCachedLinks(queryClient, (items) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                isActive,
                status: getLinkStatus({ ...item, isActive }),
              }
            : item,
        ),
      ),
    }),

    onError: (_error, _input, context) => context?.rollback(),

    onSettled: () => invalidateLinks(queryClient),
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLinkFn({ data: { id } }),

    onMutate: async (id) => ({
      rollback: await patchCachedLinks(queryClient, (items) =>
        items.filter((item) => item.id !== id),
      ),
    }),

    onError: (_error, _id, context) => context?.rollback(),

    onSettled: () => invalidateLinks(queryClient),
  });
}
