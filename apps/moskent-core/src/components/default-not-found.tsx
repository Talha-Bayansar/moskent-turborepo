import { Button } from "@repo/ui/components/button";
import { Link } from "@tanstack/react-router";
import { m } from "~/paraglide/messages";

export function DefaultNotFound() {
  return (
    <div className="space-y-2 p-2">
      <p>{m.pages_not_found_message()}</p>
      <p className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={() => window.history.back()}>
          {m.pages_not_found_go_back()}
        </Button>
        <Button render={<Link to="/" />} variant="secondary" nativeButton={false}>
          {m.pages_not_found_home()}
        </Button>
      </p>
    </div>
  );
}
