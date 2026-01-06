import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)/create-organization")({
  component: CreateOrganizationLayout,
});

function CreateOrganizationLayout() {
  return <Outlet />;
}
