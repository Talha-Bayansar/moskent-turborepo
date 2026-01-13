import { createFileRoute } from "@tanstack/react-router";
import { OrganizationSetupWizard } from "~/features/organizations/ui/organization-setup-wizard";

export const Route = createFileRoute("/(authenticated)/create-organization/")({
  component: CreateOrganizationPage,
});

function CreateOrganizationPage() {
  return <OrganizationSetupWizard />;
}
