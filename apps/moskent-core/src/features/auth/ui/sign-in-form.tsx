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
import { signInSchema, type SignInInput } from "../model/validation";

interface SignInFormProps {
  redirectUrl: string;
}

export function SignInForm({ redirectUrl }: SignInFormProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: signInMutate, isPending } = useMutation({
    mutationFn: async (data: SignInInput) => {
      await authClient.signIn.email(
        {
          ...data,
          callbackURL: redirectUrl,
        },
        {
          onError: ({ error }) => {
            toast.error(error.message || m.auth_error_signin());
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
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value }) => {
      signInMutate(value);
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
                  autoComplete="current-password"
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
            {isPending ? m.auth_login_loading() : m.auth_login_button()}
          </span>
        </Button>
      </div>
    </form>
  );
}
