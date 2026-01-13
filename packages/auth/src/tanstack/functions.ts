import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { generateId } from "better-auth";
import { auth } from "../auth";

export const $getUser = createServerFn({ method: "GET" }).handler(async () => {
  const session = await auth.api.getSession({
    headers: getRequest().headers,
    returnHeaders: true,
  });

  // Forward any Set-Cookie headers to the client, e.g. for session/cache refresh
  const cookies = session.headers?.getSetCookie();
  if (cookies?.length) {
    setResponseHeader("Set-Cookie", cookies);
  }

  return session.response?.user || null;
});

export const $getSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await auth.api.getSession({
    headers: getRequest().headers,
    returnHeaders: true,
  });

  // Forward any Set-Cookie headers to the client, e.g. for session/cache refresh
  const cookies = session.headers?.getSetCookie();
  if (cookies?.length) {
    setResponseHeader("Set-Cookie", cookies);
  }

  return session.response?.session || null;
});

export const $getUserOrganizations = createServerFn({ method: "GET" }).handler(
  async () => {
    const request = getRequest();
    const headers = request.headers;

    // Get session and verify user is authenticated
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      return [];
    }

    // List user's organizations using Better Auth Organization API
    const organizations = await auth.api.listOrganizations({
      headers,
    });

    return organizations || [];
  },
);

export const $getActiveMember = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const headers = request.headers;

  // Get session and verify user is authenticated
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    return null;
  }

  // Get active member using Better Auth Organization API
  // This returns the user's member details including their role in the active organization
  try {
    const activeMember = await auth.api.getActiveMember({
      headers,
    });

    return activeMember || null;
  } catch (error) {
    // If there's no active organization, this will throw an error
    // Return null in that case
    return null;
  }
});

export const $setActiveOrganization = createServerFn({ method: "POST" })
  .inputValidator((data: { organizationId: string }) => data)
  .handler(async ({ data }) => {
    const request = getRequest();
    const headers = request.headers;

    // Get session and verify user is authenticated
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Set active organization using Better Auth Organization API
    await auth.api.setActiveOrganization({
      body: {
        organizationId: data.organizationId,
      },
      headers,
    });

    return { success: true };
  });

export const $createOrganizationUser = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { email: string; name: string; role: string; organizationId: string }) => data,
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    const headers = request.headers;

    // Get session and verify user is authenticated
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Verify user has permission to create users in the organization using Better Auth permission system
    // This uses the dynamic permission system - permissions will be configured later
    const hasPermission = await auth.api.hasPermission({
      body: {
        permissions: {
          member: ["create"], // Check if user has permission to create members (which includes creating users)
        },
      },
      headers,
    });

    if (!hasPermission) {
      throw new Error("You do not have permission to create users in this organization");
    }

    // Check if user already exists using Better Auth Admin API
    const existingUsers = await auth.api.listUsers({
      query: {
        filterField: "email",
        filterValue: data.email,
        filterOperator: "eq",
        limit: 1,
      },
      headers,
    });

    if (existingUsers.users && existingUsers.users.length > 0) {
      throw new Error("User with this email already exists");
    }

    // Generate secure password
    const password = generateId(16); // Or use a more sophisticated password generator

    // Use Better Auth Admin API to create user - handles password hashing automatically
    // Note: We need to temporarily grant admin role or use adminUserIds for this operation
    // Alternatively, we can check if the user has admin privileges via organization role
    const newUser = await auth.api.createUser({
      body: {
        email: data.email,
        password: password,
        name: data.name,
        data: {
          isOrganizationBound: true,
        },
      },
      headers,
    });

    // Add user as member to organization using Better Auth Organization API
    await auth.api.addMember({
      body: {
        userId: newUser.user.id,
        role: data.role as "owner" | "admin" | "member",
        organizationId: data.organizationId,
      },
      headers,
    });

    // Return credentials for owner to share
    return {
      userId: newUser.user.id,
      email: data.email,
      password, // Owner will share this with the user
      role: data.role,
    };
  });
