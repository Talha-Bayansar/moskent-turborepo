import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Switch } from "@repo/ui/components/switch";
import { useForm } from "@tanstack/react-form-start";
import { m } from "~/paraglide/messages";
import { teamCreateSchema } from "../model/validation";

interface OrganizationTeamStepProps {
  defaultValues?: { createTeam: boolean; teamName?: string };
  onValuesChange?: (values: { createTeam: boolean; teamName?: string }) => void;
}

export function OrganizationTeamStep({
  defaultValues,
  onValuesChange,
}: OrganizationTeamStepProps) {
  const form = useForm({
    defaultValues: {
      createTeam: defaultValues?.createTeam ?? false,
      teamName: defaultValues?.teamName || "",
    },
    validators: {
      onChange: ({ value }) => {
        if (value.createTeam) {
          return teamCreateSchema.safeParse({ name: value.teamName });
        }
        return { success: true as const, value: undefined };
      },
    },
    onSubmit: async () => {
      // Handled by parent wizard
    },
  });

  const notifyParent = (createTeam: boolean, teamName: string) => {
    if (onValuesChange) {
      const newValues = { createTeam, teamName };
      // Only notify if valid (team name required when createTeam is true)
      if (!createTeam || (createTeam && teamName.length >= 2)) {
        onValuesChange(newValues);
      }
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="create-team-switch"
            className="cursor-pointer text-sm font-medium"
          >
            {m.org_setup_create_initial_team_label()}
          </label>
          <p className="text-muted-foreground text-xs">
            {m.org_setup_step_team_description()}
          </p>
        </div>
        <form.Field
          name="createTeam"
          children={(field) => (
            <Switch
              id="create-team-switch"
              checked={field.state.value}
              onCheckedChange={(checked) => {
                field.handleChange(checked);
                notifyParent(checked, form.state.values.teamName);
              }}
            />
          )}
        />
      </div>

      <form.Subscribe selector={(state) => state.values.createTeam}>
        {(createTeam) =>
          createTeam && (
            <form.Field
              name="teamName"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {m.org_setup_team_name_label()}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder={m.org_setup_team_name_placeholder()}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.handleChange(value);
                        notifyParent(form.state.values.createTeam, value);
                      }}
                      aria-invalid={isInvalid}
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
          )
        }
      </form.Subscribe>
    </div>
  );
}
