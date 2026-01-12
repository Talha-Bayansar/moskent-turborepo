import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { createFileRoute, Link } from "@tanstack/react-router";
import { m } from "~/paraglide/messages";
import { LocaleSwitcher } from "~/shared/ui/locale-switcher";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const features = [
    {
      title: m.landing_feature_contacts_title(),
      description: m.landing_feature_contacts_description(),
    },
    {
      title: m.landing_feature_activities_title(),
      description: m.landing_feature_activities_description(),
    },
    {
      title: m.landing_feature_attendance_title(),
      description: m.landing_feature_attendance_description(),
    },
    {
      title: m.landing_feature_organizations_title(),
      description: m.landing_feature_organizations_description(),
    },
    {
      title: m.landing_feature_teams_title(),
      description: m.landing_feature_teams_description(),
    },
    {
      title: m.landing_feature_multi_tenant_title(),
      description: m.landing_feature_multi_tenant_description(),
    },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      {/* Header/Navigation */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xl font-bold">
              {m.app_title()}
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {m.landing_nav_login()}
            </Link>
            <Button render={<Link to="/signup" />} size="sm" nativeButton={false}>
              {m.landing_nav_signup()}
            </Button>
            <LocaleSwitcher />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center gap-8 px-4 py-24 text-center md:py-32">
        <div className="flex max-w-3xl flex-col gap-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {m.landing_hero_title()}
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl md:text-2xl">
            {m.landing_hero_subtitle()}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              render={<Link to="/signup" />}
              size="lg"
              className="w-full sm:w-auto"
              nativeButton={false}
            >
              {m.landing_hero_cta_primary()}
            </Button>
            <Button
              render={<Link to="/login" />}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              nativeButton={false}
            >
              {m.landing_hero_cta_secondary()}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-16 md:py-24">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {m.landing_features_title()}
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg">
            {m.landing_features_subtitle()}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-16 md:py-24">
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl">
              {m.landing_cta_title()}
            </CardTitle>
            <CardDescription className="mt-4 text-base sm:text-lg">
              {m.landing_cta_description()}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button render={<Link to="/signup" />} size="lg" nativeButton={false}>
              {m.landing_cta_button()}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <p className="font-semibold">{m.app_title()}</p>
            <p className="text-muted-foreground text-sm">{m.app_description()}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {m.landing_nav_login()}
            </Link>
            <Link
              to="/signup"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {m.landing_nav_signup()}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
