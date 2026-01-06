import {
  authQueryOptions,
  userOrganizationsQueryOptions,
} from "@repo/auth/tanstack/queries";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)")({
  component: Outlet,
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.ensureQueryData({
      ...authQueryOptions(),
      revalidateIfStale: true,
    });
    if (!user) {
      throw redirect({ to: "/login" });
    }

    // Fetch user's organizations
    const organizations = await context.queryClient.ensureQueryData({
      ...userOrganizationsQueryOptions(),
      revalidateIfStale: true,
    });

    // If user has no organizations and is not already on create-organization page,
    // redirect to create-organization
    if (
      (!organizations || organizations.length === 0) &&
      !location.pathname.includes("/create-organization")
    ) {
      throw redirect({ to: "/create-organization" });
    }

    // If user has organizations and is on create-organization page,
    // redirect to dashboard
    if (
      organizations &&
      organizations.length > 0 &&
      location.pathname.includes("/create-organization")
    ) {
      throw redirect({ to: "/dashboard" });
    }

    // re-return to update type as non-null for child routes
    return { user, organizations };
  },
});
