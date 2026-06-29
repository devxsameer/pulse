import { useForm } from "@tanstack/react-form";
import { Field, FieldGroup } from "#/components/ui/field";
import { Button } from "#/components/ui/button";
import { loginSchema } from "../schemas/login.schema";
import { FormInputField } from "./form-input-field";
import { useLogin } from "../client/auth.mutations";

function LoginForm() {
  const loginMutation = useLogin();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: loginSchema,
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      loginMutation.mutate(value);
    },
  });
  return (
    <form
      id="login-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
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
              autoComplete="password"
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
                disabled={!canSubmit || loginMutation.isPending}
              >
                {isSubmitting || loginMutation.isPending
                  ? "Logging In..."
                  : "Log In"}
              </Button>
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}

export default LoginForm;
