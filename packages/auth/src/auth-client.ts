import { stripeClient } from "@better-auth/stripe/client";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: process.env.VITE_BASE_URL,
  plugins: [
    organizationClient({
      teams: {
        enabled: true,
      },
    }),
    adminClient(),
    stripeClient({
      subscription: true, // Enable subscription management
    }),
  ],
});

export default authClient;
