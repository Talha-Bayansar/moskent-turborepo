import authClient from "@repo/auth/auth-client";
import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { Button } from "@repo/ui/components/button";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useForm } from "@tanstack/react-form-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { m } from "~/paraglide/messages";
import { signUpSchema, type SignUpInput } from "../model/validation";

interface SignUpFormProps {
  redirectUrl: string;
}

export function SignUpForm({ redirectUrl }: SignUpFormProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: signUpMutate, isPending } = useMutation({
    mutationFn: async (data: Omit<SignUpInput, "confirmPassword">) => {
      await authClient.signUp.email(
        {
          ...data,
          callbackURL: redirectUrl,
        },
        {
          onError: ({ error }) => {
            toast.error(error.message || m.auth_error_signup());
          },
        },
      );
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authQueryOptions().queryKey });
      navigate({ to: redirectUrl });
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...signUpData } = value;
      signUpMutate(signUpData);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="flex flex-col gap-5">
        <form.Field
          name="name"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{m.auth_name_label()}</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder={m.auth_name_placeholder()}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isPending}
                  autoComplete="name"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <form.Field
          name="email"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{m.auth_email_label()}</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder={m.auth_email_placeholder()}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isPending}
                  autoComplete="email"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <form.Field
          name="password"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{m.auth_password_label()}</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder={m.auth_password_placeholder()}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isPending}
                  autoComplete="new-password"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <form.Field
          name="confirmPassword"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  {m.auth_password_confirm_label()}
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder={m.auth_password_confirm_placeholder()}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isPending}
                  autoComplete="new-password"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <Button
          type="submit"
          className="mt-2 w-full"
          size="lg"
          disabled={isPending || !form.state.canSubmit}
        >
          <span className="flex items-center gap-2">
            {isPending && <Spinner />}
            {isPending ? m.auth_signup_loading() : m.auth_signup_button()}
          </span>
        </Button>
      </div>
    </form>
  );
}
