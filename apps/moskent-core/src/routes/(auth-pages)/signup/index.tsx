import { createFileRoute, Link } from "@tanstack/react-router";
import { SignUpForm } from "~/features/auth/ui/sign-up-form";

export const Route = createFileRoute("/(auth-pages)/signup/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { redirectUrl } = Route.useRouteContext();

  return (
    <div className="flex flex-col gap-6">
      <SignUpForm redirectUrl={redirectUrl} />
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link to="/login" className="underline underline-offset-4">
          Login
        </Link>
      </div>
    </div>
  );
}
