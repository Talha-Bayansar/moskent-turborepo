import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-10 p-2">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold sm:text-4xl">Dashboard</h1>
        <p className="text-muted-foreground text-center">
          Welcome to your dashboard. This page will be populated with features soon.
        </p>
      </div>
    </div>
  );
}
