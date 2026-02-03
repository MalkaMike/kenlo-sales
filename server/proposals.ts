import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { proposals, InsertProposal } from "../drizzle/schema";

export async function createProposal(proposal: InsertProposal) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(proposals).values(proposal);
  return result;
}

export async function getProposalsByUser(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(proposals).where(eq(proposals.userId, userId));
  return result;
}
