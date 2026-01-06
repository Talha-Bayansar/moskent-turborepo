import { createFileRoute, Link } from "@tanstack/react-router";
import { SignInForm } from "~/features/auth/ui/sign-in-form";

export const Route = createFileRoute("/(auth-pages)/login/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { redirectUrl } = Route.useRouteContext();

  return (
    <div className="flex flex-col gap-6">
      <SignInForm redirectUrl={redirectUrl} />
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </div>
  );
}
