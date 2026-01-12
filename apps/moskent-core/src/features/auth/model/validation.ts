import { z } from "zod";
import { m } from "~/paraglide/messages";

export const signInSchema = z.object({
  email: z.email(m.auth_validation_email_invalid()),
  password: z.string().min(6, m.auth_validation_password_min_length()),
});

export const signUpSchema = z
  .object({
    name: z.string().min(1, m.auth_validation_name_required()),
    email: z.email(m.auth_validation_email_invalid()),
    password: z.string().min(6, m.auth_validation_password_min_length()),
    confirmPassword: z.string().min(6, m.auth_validation_password_min_length()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: m.auth_validation_passwords_must_match(),
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
