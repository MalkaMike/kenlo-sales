/**
 * E2E Auth Setup
 *
 * Creates a valid JWT session token and injects it as a cookie
 * so Playwright tests can access authenticated routes.
 *
 * This creates a test user in the DB (if not exists) and signs
 * a JWT with the same secret the server uses.
 */
import { SignJWT } from "jose";

const TEST_USER = {
  openId: "e2e-test-user-001",
  name: "E2E Test User",
  email: "e2e-test@kenlo.com.br",
};

/**
 * Generate a valid session JWT for E2E tests.
 * Uses the same JWT_SECRET and signing algorithm as the server.
 */
export async function generateTestSessionToken(): Promise<string> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET env var is required for E2E auth setup");
  }
  const appId = process.env.VITE_APP_ID;
  if (!appId) {
    throw new Error("VITE_APP_ID env var is required for E2E auth setup");
  }

  const secretKey = new TextEncoder().encode(secret);
  const expirationSeconds = Math.floor((Date.now() + 365 * 24 * 60 * 60 * 1000) / 1000);

  return new SignJWT({
    openId: TEST_USER.openId,
    appId,
    name: TEST_USER.name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

/**
 * Ensure the test user exists in the database.
 * Calls the server's upsert endpoint or directly inserts.
 */
export async function ensureTestUserExists(baseURL: string): Promise<void> {
  // We'll create the user by making an authenticated request.
  // The server auto-creates users on first authenticated request
  // via authenticateRequest -> getUserByOpenId -> upsertUser flow.
  // So we just need to make any authenticated tRPC call.
  const token = await generateTestSessionToken();

  const response = await fetch(`${baseURL}/api/trpc/auth.me`, {
    headers: {
      Cookie: `app_session_id=${token}`,
    },
  });

  // If 200, user was found or created. If error, the user will be
  // created on the first page visit with the cookie.
  if (response.ok) {
    console.log("[E2E Auth] Test user verified/created successfully");
  } else {
    console.log("[E2E Auth] auth.me returned", response.status, "- user will be created on first visit");
  }
}

export { TEST_USER };
