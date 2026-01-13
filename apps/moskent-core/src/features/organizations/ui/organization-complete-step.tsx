import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Link } from "@tanstack/react-router";
import { m } from "~/paraglide/messages";

interface OrganizationCompleteStepProps {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  team?: {
    id: string;
    name: string;
  } | null;
}

export function OrganizationCompleteStep({
  organization,
  team,
}: OrganizationCompleteStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-2xl font-bold">{m.org_setup_step_complete_title()}</h2>
        <p className="text-muted-foreground">{m.org_setup_step_complete_description()}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{m.org_setup_created_org_label()}</CardTitle>
          <CardDescription>{organization.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Slug:</span>
              <span className="font-mono text-sm">{organization.slug}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {team && (
        <Card>
          <CardHeader>
            <CardTitle>{m.org_setup_created_team_label()}</CardTitle>
            <CardDescription>{team.name}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Button
        size="lg"
        className="w-full"
        render={<Link to="/dashboard">{m.org_setup_go_to_dashboard()}</Link>}
      />
    </div>
  );
}
