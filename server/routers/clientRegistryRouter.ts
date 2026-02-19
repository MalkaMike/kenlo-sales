/**
 * Client Registry router — admin-only endpoints for managing the permanent client list.
 * Clients are automatically registered when quotes are saved.
 * Admins can view, search, and clean up (soft delete) client records.
 */

import { adminProcedure, router } from "../_core/trpc";
import {
  listClients,
  getClientRegistryStats,
  softDeleteClient,
  softDeleteClientsBatch,
} from "../clientRegistry";
import { z } from "zod";

export const clientRegistryRouter = router({
  list: adminProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          limit: z.number().optional().default(500),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return await listClients({
        search: input?.search,
        limit: input?.limit,
      });
    }),

  stats: adminProcedure.query(async () => {
    return await getClientRegistryStats();
  }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await softDeleteClient(input.id);
    }),

  deleteBatch: adminProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      return await softDeleteClientsBatch(input.ids);
    }),
});
