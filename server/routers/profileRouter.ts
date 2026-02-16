/**
 * Profile router — user profile management.
 */

import { protectedProcedure, router } from "../_core/trpc";
import { updateUserProfile, getUserById } from "../db";
import { getQuotesByUser } from "../quotes";
import { storagePut } from "../storage";
import { z } from "zod";

export const profileRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) {
      throw new Error("User not authenticated");
    }
    const user = await getUserById(ctx.user.id);
    return user;
  }),

  update: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      bio: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new Error("User not authenticated");
      }
      const updatedUser = await updateUserProfile(ctx.user.id, input);
      return updatedUser;
    }),

  uploadAvatar: protectedProcedure
    .input(z.object({
      fileData: z.string(),
      fileName: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new Error("User not authenticated");
      }

      const buffer = Buffer.from(input.fileData, 'base64');
      const fileKey = `avatars/${ctx.user.id}/${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      const updatedUser = await updateUserProfile(ctx.user.id, { avatarUrl: url });
      return { avatarUrl: url, user: updatedUser };
    }),

  getProposalHistory: protectedProcedure
    .input(z.object({
      limit: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Use OAuth user name to filter quotes (no more salesperson JWT)
      const quotes = await getQuotesByUser({
        userName: ctx.user?.name || undefined,
        limit: input.limit || 100,
      });

      return quotes;
    }),
});
