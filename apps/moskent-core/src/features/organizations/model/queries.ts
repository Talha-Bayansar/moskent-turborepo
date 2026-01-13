/**
 * Query keys for organization-related queries.
 * Used for query invalidation after mutations.
 * Better Auth provides the actual query hooks (e.g., authClient.useListOrganizations()).
 */
export const organizationQueryKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationQueryKeys.all, "list"] as const,
  list: () => [...organizationQueryKeys.lists()] as const,
  details: () => [...organizationQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...organizationQueryKeys.details(), id] as const,
};
