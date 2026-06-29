import { signupSchema } from "../schemas/signup.schema";
import { useForm } from "@tanstack/react-form";
import { Field, FieldGroup } from "#/components/ui/field";
import { Button } from "#/components/ui/button";
import { FormInputField } from "./form-input-field";
import { useSignup } from "../client/auth.mutations";

function SignupForm() {
  const signupMutation = useSignup();
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: signupSchema,
      onSubmit: signupSchema,
    },
    onSubmit: async ({ value }) => {
      signupMutation.mutate(value);
    },
  });
  return (
    <form
      id="signup-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="name"
          children={(field) => (
            <FormInputField
              field={field}
              label="Name"
              placeholder="John Wick"
              autoComplete="name"
            />
          )}
        />
        <form.Field
          name="email"
          children={(field) => (
            <FormInputField
              field={field}
              type="email"
              label="Email"
              placeholder="name@example.com"
              autoComplete="email"
            />
          )}
        />
        <form.Field
          name="password"
          children={(field) => (
            <FormInputField
              field={field}
              label="Password"
              type="password"
              autoComplete="new-password"
            />
          )}
        />
        <form.Field
          name="confirmPassword"
          children={(field) => (
            <FormInputField
              field={field}
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
            />
          )}
        />
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Field>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!canSubmit || signupMutation.isPending}
              >
                {isSubmitting || signupMutation.isPending
                  ? "Signing Up..."
                  : "Sign Up"}
              </Button>
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}

export default SignupForm;
