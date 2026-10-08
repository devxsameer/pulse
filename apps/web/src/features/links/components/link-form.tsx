import { useForm } from "@tanstack/react-form";
import { Loader2, WandSparkles } from "lucide-react";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "#/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";

import { useCreateLink, useUpdateLink } from "../client/links.mutations";
import type { LinkItem } from "../client/links.types";
import {
  getUrlOrigin,
  useMetadataPrefill,
} from "../client/use-metadata-prefill";
import type { LinkMetadata } from "../lib/html-metadata";
import { createLinkSchema } from "../schemas/create-link.schema";
import { editLinkSchema } from "../schemas/manage-link.schema";

type LinkFormProps = {
  /** Edit this link; omit to create a new one. */
  link?: LinkItem;
  onDone?: () => void;
};

// Short codes are immutable, so edit mode only needs it to be a string.
const editFormSchema = editLinkSchema.extend({ shortCode: z.string() });

// datetime-local wants "YYYY-MM-DDTHH:mm" in the user's local time.
function toDateTimeLocal(date: Date | null) {
  if (!date) return "";

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function LinkForm({ link, onDone }: LinkFormProps) {
  const isEdit = Boolean(link);

  const createLink = useCreateLink();
  const updateLink = useUpdateLink();

  const initialExpiresAt = toDateTimeLocal(link?.expiresAt ?? null);

  // Favicon and image describe a destination; remember which origin they came from.
  const assetsOrigin = useRef(link ? getUrlOrigin(link.destinationUrl) : null);

  const form = useForm({
    defaultValues: {
      destinationUrl: link?.destinationUrl ?? "",
      shortCode: link?.shortCode ?? "",
      title: link?.title ?? "",
      description: link?.description ?? "",
      expiresAt: initialExpiresAt,
      faviconUrl: link?.faviconUrl ?? "",
      imageUrl: link?.imageUrl ?? "",
    },

    validators: {
      onSubmit: isEdit ? editFormSchema : createLinkSchema,
    },

    onSubmit: async ({ value }) => {
      // datetime-local has no timezone; convert in the browser so the server gets the user's intent.
      // An untouched expiration is sent back exactly, so editing other fields never re-validates it.
      const expiresAt =
        link?.expiresAt && value.expiresAt === initialExpiresAt
          ? link.expiresAt.toISOString()
          : value.expiresAt
            ? new Date(value.expiresAt).toISOString()
            : "";

      // Drop assets that belong to a different site than the final destination.
      const assetsMatch =
        getUrlOrigin(value.destinationUrl) === assetsOrigin.current;
      const assets = {
        faviconUrl: assetsMatch ? value.faviconUrl : "",
        imageUrl: assetsMatch ? value.imageUrl : "",
      };

      try {
        if (link) {
          await updateLink.mutateAsync({
            id: link.id,
            destinationUrl: value.destinationUrl,
            title: value.title,
            description: value.description,
            expiresAt,
            ...assets,
          });

          toast.success("Link updated");
        } else {
          const createdLink = await createLink.mutateAsync({
            ...value,
            expiresAt,
            ...assets,
          });

          toast.success("Link created", {
            description: `/r/${createdLink.shortCode} is ready to share.`,
          });

          form.reset();
          assetsOrigin.current = null;
        }

        onDone?.();
      } catch (error) {
        toast.error(isEdit ? "Couldn't update link" : "Couldn't create link", {
          description: getErrorMessage(error),
        });
      }
    },
  });

  const applyMetadata = useCallback(
    (url: string, metadata: LinkMetadata) => {
      // Never overwrite what the user already typed.
      if (metadata.title && !form.getFieldValue("title").trim()) {
        form.setFieldValue("title", metadata.title);
      }
      if (metadata.description && !form.getFieldValue("description").trim()) {
        form.setFieldValue("description", metadata.description);
      }

      form.setFieldValue("faviconUrl", metadata.faviconUrl ?? "");
      form.setFieldValue("imageUrl", metadata.imageUrl ?? "");
      assetsOrigin.current = getUrlOrigin(url);
    },
    [form],
  );

  const metadata = useMetadataPrefill(applyMetadata);

  return (
    <form
      id={isEdit ? "edit-link-form" : "create-link-form"}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();

        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="destinationUrl"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Destination URL</FieldLabel>

                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="url"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onPaste={(event) => {
                      const pasted = event.clipboardData.getData("text").trim();

                      // Only prefill when the paste is the whole URL, after the input updates.
                      setTimeout(() => {
                        const current = form.getFieldValue("destinationUrl");
                        if (current.trim() === pasted) {
                          void metadata.prefill(pasted);
                        }
                      });
                    }}
                    aria-invalid={isInvalid}
                    aria-busy={metadata.isFetching}
                    placeholder="https://example.com/launch"
                    autoComplete="url"
                    autoFocus
                    className="pr-9"
                  />

                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    {metadata.isFetching ? (
                      <Loader2 className="text-muted-foreground size-4 animate-spin" />
                    ) : (
                      <form.Subscribe
                        selector={(state) => state.values.faviconUrl}
                        children={(faviconUrl) =>
                          faviconUrl ? (
                            <img
                              key={faviconUrl}
                              src={faviconUrl}
                              alt=""
                              className="size-4"
                              referrerPolicy="no-referrer"
                              onError={(event) => {
                                event.currentTarget.hidden = true;
                              }}
                            />
                          ) : null
                        }
                      />
                    )}
                  </div>
                </div>

                <FieldDescription>
                  {metadata.isFetching
                    ? "Fetching title and icon…"
                    : "Where visitors should be redirected. Paste a URL to prefill the title."}
                </FieldDescription>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="shortCode"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Short code
                  {!isEdit && (
                    <span className="text-muted-foreground font-normal">
                      Optional
                    </span>
                  )}
                </FieldLabel>

                <div className="flex">
                  <div className="bg-muted text-muted-foreground flex h-9 items-center rounded-l-md border border-r-0 px-3 text-sm">
                    /r/
                  </div>

                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="my-launch"
                    autoComplete="off"
                    readOnly={isEdit}
                    className="rounded-l-none read-only:opacity-70"
                  />
                </div>

                <FieldDescription>
                  {isEdit
                    ? "Short codes can't be changed after creation."
                    : "Leave blank to generate one automatically."}
                </FieldDescription>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="title"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Title
                  <span className="text-muted-foreground font-normal">
                    Optional
                  </span>
                </FieldLabel>

                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Pulse launch campaign"
                  autoComplete="off"
                />

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="description"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Description
                  <span className="text-muted-foreground font-normal">
                    Optional
                  </span>
                </FieldLabel>

                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Link used for the Pulse launch campaign."
                  rows={3}
                />

                <FieldDescription>
                  Add context for organization and future AI insights.
                </FieldDescription>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="expiresAt"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Expiration
                  <span className="text-muted-foreground font-normal">
                    Optional
                  </span>
                </FieldLabel>

                <Input
                  id={field.name}
                  name={field.name}
                  type="datetime-local"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                />

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSubmitting}
              >
                Reset
              </Button>

              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {isEdit ? "Saving..." : "Creating..."}
                  </>
                ) : isEdit ? (
                  "Save changes"
                ) : (
                  <>
                    <WandSparkles className="size-4" />
                    Create link
                  </>
                )}
              </Button>
            </div>
          )}
        />
      </FieldGroup>
    </form>
  );
}

// Server functions only surface user-safe messages; anything else is already genericised there.
function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Something went wrong. Please try again.";
}
