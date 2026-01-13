import { queryOptions } from "@tanstack/react-query";
import { $getSession, $getUser, $getUserOrganizations } from "./functions";

export const authQueryOptions = () =>
  queryOptions({
    queryKey: ["user"],
    queryFn: ({ signal }) => $getUser({ signal }),
  });

export type AuthQueryResult = Awaited<ReturnType<typeof $getUser>>;

export const userOrganizationsQueryOptions = () =>
  queryOptions({
    queryKey: ["user", "organizations"],
    queryFn: ({ signal }) => $getUserOrganizations({ signal }),
  });

export type UserOrganizationsQueryResult = Awaited<
  ReturnType<typeof $getUserOrganizations>
>;

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: ["session"],
    queryFn: ({ signal }) => $getSession({ signal }),
  });

export type SessionQueryResult = Awaited<ReturnType<typeof $getSession>>;
