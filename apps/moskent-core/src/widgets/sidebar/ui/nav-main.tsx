import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { m } from "~/paraglide/messages";

export function NavMain() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link to="/dashboard" />}
            isActive={currentPath === "/dashboard"}
            tooltip={m.sidebar_dashboard()}
          >
            <LayoutDashboard />
            <span>{m.sidebar_dashboard()}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
