import { z } from "zod";
import { m } from "~/paraglide/messages";

export const organizationCreateSchema = z.object({
  name: z.string().min(2, m.org_setup_validation_name_min_length()),
  slug: z
    .string()
    .min(2, m.org_setup_validation_slug_required())
    .regex(/^[a-z0-9-]+$/, m.org_setup_validation_slug_invalid_format()),
});

export const teamCreateSchema = z.object({
  name: z.string().min(2, m.org_setup_validation_name_min_length()),
});

export type OrganizationCreateInput = z.infer<typeof organizationCreateSchema>;
export type TeamCreateInput = z.infer<typeof teamCreateSchema>;
