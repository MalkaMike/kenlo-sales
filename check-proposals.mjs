import { drizzle } from "drizzle-orm/mysql2";
import { proposals } from "./drizzle/schema.ts";
import { desc } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);
const result = await db.select().from(proposals).orderBy(desc(proposals.createdAt)).limit(1);
console.log(JSON.stringify(result, null, 2));
