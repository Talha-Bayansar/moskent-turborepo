import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)/create-organization/")({
  component: CreateOrganizationPage,
});

function CreateOrganizationPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-10 p-2">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold sm:text-4xl">Create Organization</h1>
        <p className="text-muted-foreground text-center">
          Create your organization to get started. This page will be populated with a form
          soon.
        </p>
      </div>
    </div>
  );
}
