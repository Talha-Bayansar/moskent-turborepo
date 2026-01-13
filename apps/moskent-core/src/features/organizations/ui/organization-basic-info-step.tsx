import authClient from "@repo/auth/auth-client";
import { Badge } from "@repo/ui/components/badge";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { useForm } from "@tanstack/react-form-start";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { m } from "~/paraglide/messages";
import {
  organizationCreateSchema,
  type OrganizationCreateInput,
} from "../model/validation";

interface OrganizationBasicInfoStepProps {
  defaultValues?: Partial<OrganizationCreateInput>;
  onValuesChange?: (values: OrganizationCreateInput) => void;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function OrganizationBasicInfoStep({
  defaultValues,
  onValuesChange,
}: OrganizationBasicInfoStepProps) {
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm({
    defaultValues: {
      name: defaultValues?.name || "",
      slug: defaultValues?.slug || "",
    },
    validators: {
      onChange: organizationCreateSchema,
    },
    onSubmit: async () => {
      // Handled by parent wizard
    },
  });

  const checkSlugAvailability = (slug: string) => {
    // Clear previous timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    if (!slug || slug.length < 2) {
      setSlugStatus("idle");
      return;
    }

    setSlugStatus("checking");

    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await authClient.organization.checkSlug({ slug });
        setSlugStatus(result.data?.status ? "available" : "unavailable");
      } catch {
        toast.error(m.org_setup_validation_slug_taken());
        setSlugStatus("idle");
      }
    }, 500);
  };

  const handleNameChange = (value: string) => {
    const currentSlug = form.state.values.slug;
    let newSlug = currentSlug;

    // Auto-generate slug if slug is empty
    if (value) {
      newSlug = generateSlug(value);
      form.setFieldValue("slug", newSlug);
      // Check availability of generated slug
      checkSlugAvailability(newSlug);
    } else {
      form.setFieldValue("slug", "");
    }

    // Notify parent with computed values
    if (onValuesChange) {
      const newValues = { name: value, slug: newSlug };
      // Validate the new values
      const validation = organizationCreateSchema.safeParse(newValues);
      if (validation.success) {
        onValuesChange(newValues);
      }
    }
  };

  const handleSlugChange = (value: string) => {
    checkSlugAvailability(value);

    // Notify parent with computed values
    if (onValuesChange) {
      const newValues = { name: form.state.values.name, slug: value };
      // Validate the new values
      const validation = organizationCreateSchema.safeParse(newValues);
      if (validation.success) {
        onValuesChange(newValues);
      }
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <form.Field
        name="name"
        children={(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>{m.org_setup_org_name_label()}</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                placeholder={m.org_setup_org_name_placeholder()}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  const value = e.target.value;
                  field.handleChange(value);
                  handleNameChange(value);
                }}
                aria-invalid={isInvalid}
                autoComplete="organization"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />
      <form.Field
        name="slug"
        children={(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          const showStatus =
            slugStatus !== "idle" &&
            field.state.value.length >= 2 &&
            !isInvalid &&
            /^[a-z0-9-]+$/.test(field.state.value);
          return (
            <Field data-invalid={isInvalid}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor={field.name}>
                  {m.org_setup_org_slug_label()}
                </FieldLabel>
                {showStatus && (
                  <Badge
                    variant={slugStatus === "available" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {slugStatus === "checking"
                      ? m.org_setup_slug_checking()
                      : slugStatus === "available"
                        ? m.org_setup_slug_available()
                        : m.org_setup_slug_unavailable()}
                  </Badge>
                )}
              </div>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                placeholder={m.org_setup_org_slug_placeholder()}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                  field.handleChange(value);
                  handleSlugChange(value);
                }}
                aria-invalid={isInvalid}
                autoComplete="off"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
              {!isInvalid &&
                slugStatus === "unavailable" &&
                field.state.value.length >= 2 && (
                  <p className="text-destructive mt-1 text-xs">
                    {m.org_setup_validation_slug_taken()}
                  </p>
                )}
            </Field>
          );
        }}
      />
    </div>
  );
}
