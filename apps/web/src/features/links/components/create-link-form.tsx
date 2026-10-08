import { useForm } from "@tanstack/react-form";
import { Loader2, WandSparkles } from "lucide-react";
import { toast } from "sonner";

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

import { useCreateLink } from "../client/links.mutations";
import { createLinkSchema } from "../schemas/create-link.schema";

type CreateLinkFormProps = {
  onCreated?: () => void;
};

export function CreateLinkForm({ onCreated }: CreateLinkFormProps) {
  const createLink = useCreateLink();

  const form = useForm({
    defaultValues: {
      destinationUrl: "",
      shortCode: "",
      title: "",
      description: "",
      expiresAt: "",
    },

    validators: {
      onSubmit: createLinkSchema,
    },

    onSubmit: async ({ value }) => {
      try {
        // datetime-local has no timezone; convert in the browser so the server gets the user's intent.
        const createdLink = await createLink.mutateAsync({
          ...value,
          expiresAt: value.expiresAt
            ? new Date(value.expiresAt).toISOString()
            : "",
        });

        toast.success("Link created", {
          description: `/${createdLink.shortCode} is ready to share.`,
        });

        form.reset();

        onCreated?.();
      } catch (error) {
        toast.error("Couldn't create link", {
          description: getErrorMessage(error),
        });
      }
    },
  });

  return (
    <form
      id="create-link-form"
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

                <Input
                  id={field.name}
                  name={field.name}
                  type="url"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="https://example.com/launch"
                  autoComplete="url"
                  autoFocus
                />

                <FieldDescription>
                  Where visitors should be redirected.
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
                  <span className="text-muted-foreground font-normal">
                    Optional
                  </span>
                </FieldLabel>

                <div className="flex">
                  <div className="bg-muted text-muted-foreground flex h-9 items-center rounded-l-md border border-r-0 px-3 text-sm">
                    pulse.dev/
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
                    className="rounded-l-none"
                  />
                </div>

                <FieldDescription>
                  Leave blank to generate one automatically.
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
                    Creating...
                  </>
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("Short code")) {
      return error.message;
    }
  }

  return "Something went wrong. Please try again.";
}
