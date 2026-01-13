import { $setActiveOrganization } from "@repo/auth/tanstack/functions";
import {
  activeMemberQueryOptions,
  authQueryOptions,
  sessionQueryOptions,
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

    // Get session to check for active organization
    const session = await context.queryClient.ensureQueryData({
      ...sessionQueryOptions(),
      revalidateIfStale: true,
    });

    let activeOrganizationId = session?.activeOrganizationId;
    let activeOrganization = organizations?.find(
      (org) => org.id === activeOrganizationId,
    );

    // If user has organizations but no active organization, set the first one as active
    if (
      organizations &&
      organizations.length > 0 &&
      !activeOrganizationId &&
      !activeOrganization
    ) {
      const firstOrganization = organizations[0];
      try {
        await $setActiveOrganization({ data: { organizationId: firstOrganization.id } });
        // Invalidate session query to get updated session with active organization
        await context.queryClient.invalidateQueries({
          queryKey: ["session"],
        });
        // Refetch session to get updated activeOrganizationId
        const updatedSession = await context.queryClient.ensureQueryData({
          ...sessionQueryOptions(),
          revalidateIfStale: true,
        });
        activeOrganizationId = updatedSession?.activeOrganizationId;
        activeOrganization = firstOrganization;
      } catch (error) {
        console.error("Failed to set active organization:", error);
        // Continue with null active organization if setting fails
      }
    }

    // Fetch active member (includes role) if there's an active organization
    let activeMember = null;
    if (activeOrganizationId) {
      activeMember = await context.queryClient.ensureQueryData({
        ...activeMemberQueryOptions(),
        revalidateIfStale: true,
      });
    }

    // Return all data in route context for child routes
    return {
      user,
      organizations,
      activeOrganization,
      activeMember,
    };
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
            <Separator orientation="vertical" className="mr-2" />
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
