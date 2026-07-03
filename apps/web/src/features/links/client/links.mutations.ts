import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateLinkInput } from "../schemas/create-link.schema";

import { createLinkFn } from "../server/links.functions";

import { linkKeys } from "./links.queries";

export function useCreateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLinkInput) =>
      createLinkFn({
        data: input,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: linkKeys.list(),
      });
    },
  });
}
