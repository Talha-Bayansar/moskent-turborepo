import authClient from "@repo/auth/auth-client";
import { userOrganizationsQueryOptions } from "@repo/auth/tanstack/queries";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Spinner } from "@repo/ui/components/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { m } from "~/paraglide/messages";
import { organizationQueryKeys } from "../model/queries";
import { type OrganizationCreateInput } from "../model/validation";
import { OrganizationBasicInfoStep } from "./organization-basic-info-step";
import { OrganizationCompleteStep } from "./organization-complete-step";
import { OrganizationTeamStep } from "./organization-team-step";

type Step = 1 | 2 | 3;

interface WizardState {
  step: Step;
  organizationData?: OrganizationCreateInput;
  teamData?: { createTeam: boolean; teamName?: string };
  createdOrganization?: {
    id: string;
    name: string;
    slug: string;
  };
  createdTeam?: {
    id: string;
    name: string;
  } | null;
}

export function OrganizationSetupWizard() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wizardState, setWizardState] = useState<WizardState>({
    step: 1,
  });

  const handleNext = () => {
    if (wizardState.step < 3) {
      setWizardState((prev) => ({
        ...prev,
        step: (prev.step + 1) as Step,
      }));
    }
  };

  const handleBack = () => {
    if (wizardState.step > 1) {
      setWizardState((prev) => ({
        ...prev,
        step: (prev.step - 1) as Step,
      }));
    }
  };

  const handleOrganizationDataChange = (data: OrganizationCreateInput) => {
    setWizardState((prev) => ({
      ...prev,
      organizationData: data,
    }));
  };

  const handleTeamDataChange = (data: { createTeam: boolean; teamName?: string }) => {
    setWizardState((prev) => ({
      ...prev,
      teamData: data,
    }));
  };

  const handleCreateOrganization = async () => {
    if (!wizardState.organizationData) {
      toast.error(m.org_setup_validation_name_required());
      return;
    }

    setIsSubmitting(true);

    try {
      // Create organization using Better Auth API
      const organization = await authClient.organization.create({
        name: wizardState.organizationData.name,
        slug: wizardState.organizationData.slug,
      });

      if (!organization.data) {
        throw new Error("Failed to create organization");
      }

      // Set as active organization
      await authClient.organization.setActive({
        organizationId: organization.data.id,
      });

      let createdTeam: { id: string; name: string } | null = null;

      // Create team if requested
      if (wizardState.teamData?.createTeam && wizardState.teamData.teamName) {
        try {
          const team = await authClient.organization.createTeam({
            name: wizardState.teamData.teamName,
            organizationId: organization.data.id,
          });

          if (team.data) {
            createdTeam = {
              id: team.data.id,
              name: team.data.name,
            };
          }
        } catch (teamError) {
          // Team creation failed, but organization was created
          console.error("Failed to create team:", teamError);
          toast.error("Organization created, but failed to create team");
        }
      }

      // Invalidate organization queries
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: userOrganizationsQueryOptions().queryKey,
      });

      setWizardState((prev) => ({
        ...prev,
        step: 3,
        createdOrganization: {
          id: organization.data.id,
          name: organization.data.name,
          slug: organization.data.slug,
        },
        createdTeam,
      }));
    } catch (error) {
      console.error("Failed to create organization:", error);
      toast.error(
        error instanceof Error ? error.message : m.org_setup_error_create_failed(),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = () => {
    return (
      wizardState.organizationData &&
      wizardState.organizationData.name.length >= 2 &&
      wizardState.organizationData.slug.length >= 2
    );
  };

  const renderStepContent = () => {
    switch (wizardState.step) {
      case 1:
        return (
          <OrganizationBasicInfoStep
            defaultValues={wizardState.organizationData}
            onValuesChange={handleOrganizationDataChange}
          />
        );
      case 2:
        return (
          <OrganizationTeamStep
            defaultValues={wizardState.teamData}
            onValuesChange={handleTeamDataChange}
          />
        );
      case 3:
        return wizardState.createdOrganization ? (
          <OrganizationCompleteStep
            organization={wizardState.createdOrganization}
            team={wizardState.createdTeam || undefined}
          />
        ) : null;
      default:
        return null;
    }
  };

  const renderStepTitle = () => {
    switch (wizardState.step) {
      case 1:
        return m.org_setup_step_basic_info_title();
      case 2:
        return m.org_setup_step_team_title();
      case 3:
        return m.org_setup_step_complete_title();
      default:
        return "";
    }
  };

  const renderStepDescription = () => {
    switch (wizardState.step) {
      case 1:
        return m.org_setup_step_basic_info_description();
      case 2:
        return m.org_setup_step_team_description();
      case 3:
        return m.org_setup_step_complete_description();
      default:
        return "";
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-10 p-2">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">{m.org_setup_wizard_title()}</h1>
          <p className="text-muted-foreground">{m.org_setup_wizard_description()}</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                  wizardState.step === step
                    ? "bg-primary text-primary-foreground"
                    : wizardState.step > step
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {wizardState.step > step ? "✓" : step}
              </div>
              {step < 3 && (
                <div
                  className={`h-0.5 w-8 ${
                    wizardState.step > step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{renderStepTitle()}</CardTitle>
            <CardDescription>{renderStepDescription()}</CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
          {wizardState.step < 3 && (
            <CardFooter className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={wizardState.step === 1 || isSubmitting}
              >
                {m.org_setup_button_back()}
              </Button>
              {wizardState.step === 1 && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedToStep2() || isSubmitting}
                >
                  {m.org_setup_button_next()}
                </Button>
              )}
              {wizardState.step === 2 && (
                <Button onClick={handleCreateOrganization} disabled={isSubmitting}>
                  <span className="flex items-center gap-2">
                    {isSubmitting && <Spinner />}
                    {m.org_setup_button_create()}
                  </span>
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
