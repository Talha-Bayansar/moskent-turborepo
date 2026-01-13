import authClient from "@repo/auth/auth-client";
import {
  sessionQueryOptions,
  userOrganizationsQueryOptions,
} from "@repo/auth/tanstack/queries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui/components/sidebar";
import { useQuery } from "@tanstack/react-query";
import { Building2, ChevronsUpDown } from "lucide-react";
import { m } from "~/paraglide/messages";

export function OrganizationSwitcher() {
  const { isMobile } = useSidebar();

  const { data: session } = useQuery(sessionQueryOptions());
  const { data: organizations } = useQuery(userOrganizationsQueryOptions());

  const activeOrganizationId = session?.activeOrganizationId;
  const activeOrganization = organizations?.find(
    (org) => org.id === activeOrganizationId,
  );

  const handleOrganizationSwitch = async (organizationId: string) => {
    try {
      // Set the active organization via Better Auth
      await authClient.organization.setActive({
        organizationId,
      });

      // Full page reload to ensure authenticated route's beforeLoad runs
      // This guarantees the context is updated with the correct organization and role
      window.location.reload();
    } catch (error) {
      console.error("Failed to switch organization:", error);
    }
  };

  if (!activeOrganization && !organizations?.length) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Building2 className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {activeOrganization?.name || m.sidebar_no_organization()}
              </span>
              <span className="truncate text-xs">{activeOrganization?.slug || ""}</span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                {m.sidebar_organizations_label()}
              </DropdownMenuLabel>
              {organizations?.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => handleOrganizationSwitch(org.id)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Building2 className="size-3.5 shrink-0" />
                  </div>
                  {org.name}
                  {org.id === activeOrganizationId && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
