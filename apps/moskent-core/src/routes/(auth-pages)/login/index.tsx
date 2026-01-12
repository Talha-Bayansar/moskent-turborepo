import { createFileRoute, Link } from "@tanstack/react-router";
import { SignInForm } from "~/features/auth/ui/sign-in-form";
import { m } from "~/paraglide/messages";

export const Route = createFileRoute("/(auth-pages)/login/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { redirectUrl } = Route.useRouteContext();

  return (
    <div className="flex flex-col gap-6">
      <SignInForm redirectUrl={redirectUrl} />
      <div className="text-center text-sm">
        {m.auth_login_link_text()}{" "}
        <Link to="/signup" className="underline underline-offset-4">
          {m.auth_login_link_action()}
        </Link>
      </div>
    </div>
  );
}
