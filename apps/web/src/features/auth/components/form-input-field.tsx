import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import type { AnyFieldApi } from "@tanstack/react-form";
import type { HTMLInputTypeAttribute } from "react";

type FormInputFieldProps = {
  field: AnyFieldApi;
  type?: HTMLInputTypeAttribute;
  label: string;
  placeholder?: string;
  autoComplete?: string;
};

export function FormInputField({
  field,
  type = "text",
  label,
  placeholder,
  autoComplete,
}: FormInputFieldProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />

      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}
