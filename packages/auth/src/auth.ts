import { stripe } from "@better-auth/stripe";
import { createServerOnlyFn } from "@tanstack/react-start";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { admin, organization } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import Stripe from "stripe";

import { db } from "@repo/db";

/**
 * Stripe Plugin Configuration
 *
 * Required Environment Variables:
 * - SERVER_STRIPE_SECRET_KEY: Your Stripe secret key (from Stripe Dashboard)
 * - SERVER_STRIPE_WEBHOOK_SECRET: Webhook signing secret (from Stripe Dashboard webhook configuration)
 * - SERVER_STRIPE_PRICE_BASIC: Stripe price ID for the basic plan (optional, customize as needed)
 *
 * Webhook Setup:
 * - Configure webhook endpoint in Stripe Dashboard: https://your-domain.com/api/auth/stripe/webhook
 * - Required webhook events:
 *   - checkout.session.completed
 *   - customer.subscription.created
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 */

// Initialize Stripe client
// Note: SERVER_STRIPE_SECRET_KEY must be set in environment variables
const stripeClient = new Stripe(process.env.SERVER_STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover", // Latest API version as of Stripe SDK v20.0.0
});

const getAuthConfig = createServerOnlyFn(() =>
  betterAuth({
    baseURL: process.env.VITE_BASE_URL,
    secret: process.env.SERVER_AUTH_SECRET,
    telemetry: {
      enabled: false,
    },
    database: drizzleAdapter(db, {
      provider: "pg",
    }),

    // Custom user fields for organization-bound users
    user: {
      additionalFields: {
        isOrganizationBound: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false, // Don't allow users to set this during signup
        },
      },
    },

    // https://www.better-auth.com/docs/integrations/tanstack#usage-tips
    plugins: [
      tanstackStartCookies(),
      organization({
        teams: {
          enabled: true,
          maximumTeams: 20, // Reasonable limit for teams per organization
          maximumMembersPerTeam: 50, // Reasonable limit for team members
        },
        creatorRole: "owner",
        membershipLimit: 1000, // Mosques can have many members
        organizationLimit: 5, // Platform users can manage multiple mosques
        // Restrict organization creation to platform users only
        allowUserToCreateOrganization: async (user) => {
          // Only platform users (not org-bound) can create organizations
          return !user.isOrganizationBound;
        },
        // Invitations disabled - we use direct user creation instead
        sendInvitationEmail: async () => {
          // Not used - organization owners create users directly
        },
      }),
      admin({
        // Customize admin check to allow organization owners/admins
        // By default, admin plugin checks for "admin" role or adminUserIds
        // We'll handle the permission check in our server function instead
        // The admin plugin provides the createUser API which handles password hashing
      }),
      stripe({
        stripeClient,
        stripeWebhookSecret: process.env.SERVER_STRIPE_WEBHOOK_SECRET || "",
        createCustomerOnSignUp: true,
        subscription: {
          enabled: true,
          organization: {
            enabled: true, // Enable organization-based subscriptions
          },
          plans: [
            {
              name: "starter",
              priceId: process.env.SERVER_STRIPE_PRICE_STARTER!,
              annualDiscountPriceId: process.env.SERVER_STRIPE_PRICE_STARTER_ANNUAL!, // Optional
              limits: {
                members: 100,
                teams: 5,
                membersPerTeam: 25,
                admins: 1,
              },
            },
            {
              name: "professional",
              priceId: process.env.SERVER_STRIPE_PRICE_PROFESSIONAL!,
              annualDiscountPriceId: process.env.SERVER_STRIPE_PRICE_PROFESSIONAL_ANNUAL!, // Optional
              limits: {
                members: 500,
                teams: 15,
                membersPerTeam: 50,
                admins: 5,
              },
            },
            {
              name: "enterprise",
              priceId: process.env.SERVER_STRIPE_PRICE_ENTERPRISE!,
              annualDiscountPriceId: process.env.SERVER_STRIPE_PRICE_ENTERPRISE_ANNUAL!, // Optional
              limits: {
                members: 1000, // Matches your membershipLimit
                teams: 20, // Matches your maximumTeams
                membersPerTeam: 50, // Matches your maximumMembersPerTeam
                admins: -1, // -1 for unlimited
              },
            },
          ],
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          authorizeReference: async ({ user, session, referenceId, action }, ctx) => {
            // Verify user has permission to manage subscriptions for the organization
            // This should use Better Auth's organization APIs rather than direct DB queries
            // The context (ctx) should provide access to Better Auth APIs
            // TODO: Implement proper authorization using Better Auth's organization plugin APIs
            // Example approach: Use ctx.auth.api.listMembers or similar to check membership role
            // Parameters are part of the function signature and will be used in the implementation
            return true;
          },
        },
      }),
    ],

    // https://www.better-auth.com/docs/concepts/session-management#session-caching
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
      },
    },

    // https://www.better-auth.com/docs/authentication/email-password
    emailAndPassword: {
      enabled: true,
    },

    experimental: {
      // https://www.better-auth.com/docs/adapters/drizzle#joins-experimental
      joins: true,
    },
  }),
);

export const auth = getAuthConfig();
