import { createFileRoute } from "@tanstack/react-router";
import { m } from "~/paraglide/messages";

export const Route = createFileRoute("/(authenticated)/create-organization/")({
  component: CreateOrganizationPage,
});

function CreateOrganizationPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-10 p-2">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold sm:text-4xl">
          {m.pages_create_organization_title()}
        </h1>
        <p className="text-muted-foreground text-center">
          {m.pages_create_organization_description()}
        </p>
      </div>
    </div>
  );
}
