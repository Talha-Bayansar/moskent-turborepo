import { createFileRoute, Link } from "@tanstack/react-router";
import { SignUpForm } from "~/features/auth/ui/sign-up-form";
import { m } from "~/paraglide/messages";

export const Route = createFileRoute("/(auth-pages)/signup/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { redirectUrl } = Route.useRouteContext();

  return (
    <div className="flex flex-col gap-6">
      <SignUpForm redirectUrl={redirectUrl} />
      <div className="text-center text-sm">
        {m.auth_signup_link_text()}{" "}
        <Link to="/login" className="underline underline-offset-4">
          {m.auth_signup_link_action()}
        </Link>
      </div>
    </div>
  );
}
