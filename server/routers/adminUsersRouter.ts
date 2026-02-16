/**
 * Admin Users router — manage user roles.
 */

import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const adminUsersRouter = router({
  /** List all users */
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
      })
      .from(users)
      .orderBy(users.name);

    return result;
  }),

  /** Update a user's role */
  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Prevent admin from demoting themselves
      if (input.userId === ctx.user.id && input.role !== "admin") {
        throw new Error("Você não pode remover seu próprio acesso de administrador.");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      const updated = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      return updated[0] ?? null;
    }),
});
