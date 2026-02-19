import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { pricingAdminRouter } from "./pricingAdmin";
import { quotesRouter } from "./routers/quotesRouter";
import { proposalsRouter } from "./routers/proposalsRouter";
import { profileRouter } from "./routers/profileRouter";
import { playbookRouter } from "./routers/playbookRouter";
import { adminUsersRouter } from "./routers/adminUsersRouter";
import { analyticsRouter } from "./routers/analytics";
import { clientRegistryRouter } from "./routers/clientRegistryRouter";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  pricingAdmin: pricingAdminRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  quotes: quotesRouter,
  proposals: proposalsRouter,
  profile: profileRouter,
  playbook: playbookRouter,
  adminUsers: adminUsersRouter,
  analytics: analyticsRouter,
  clientRegistry: clientRegistryRouter,
});

export type AppRouter = typeof appRouter;
