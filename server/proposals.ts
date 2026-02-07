import { getDb } from "./db";
import { proposals, InsertProposal } from "../drizzle/schema";

export async function createProposal(proposal: InsertProposal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(proposals).values(proposal);
}
