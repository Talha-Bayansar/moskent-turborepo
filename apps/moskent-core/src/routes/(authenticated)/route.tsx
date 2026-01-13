import {
  authQueryOptions,
  userOrganizationsQueryOptions,
} from "@repo/auth/tanstack/queries";
import { Separator } from "@repo/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "~/widgets/sidebar/ui/app-sidebar";

export const Route = createFileRoute("/(authenticated)")({
  component: AuthenticatedLayout,
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

function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
