import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, salespeople, Salesperson } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Salespeople authentication functions

/**
 * Get a salesperson by email for authentication
 */
export async function getSalespersonByEmail(email: string): Promise<Salesperson | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get salesperson: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(salespeople)
    .where(eq(salespeople.email, email.toLowerCase()))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get a salesperson by ID
 */
export async function getSalespersonById(id: number): Promise<Salesperson | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get salesperson: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(salespeople)
    .where(eq(salespeople.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all active salespeople
 */
export async function getAllSalespeople(): Promise<Salesperson[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get salespeople: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(salespeople)
    .where(eq(salespeople.isActive, 1));

  return result;
}

/**
 * Update user profile information
 */
export async function updateUserProfile(userId: number, data: {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user profile: database not available");
    return undefined;
  }

  await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId));

  // Return updated user
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}
