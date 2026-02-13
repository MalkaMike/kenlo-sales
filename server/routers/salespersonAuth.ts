/**
 * Salesperson authentication — JWT helpers and tRPC procedures.
 */

import { getSessionCookieOptions } from "../_core/cookies";
import { publicProcedure, router } from "../_core/trpc";
import { getSalespersonByEmail, getSalespersonById, getAllSalespeople } from "../db";
import { z } from "zod";
import * as jose from "jose";

// Fixed password for all salespeople
const SALESPERSON_PASSWORD = "KenloLobos2026!";
export const SALESPERSON_COOKIE_NAME = "kenlo_salesperson_session";

// Master account credentials
const MASTER_EMAIL = "master@kenlo.com.br";
const MASTER_PASSWORD = "Oxygen1011!";

// JWT secret for salesperson sessions
const getJwtSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || "kenlo-sales-secret-key");

// Calculate expiration time (end of current day)
function getEndOfDay(): Date {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

// Create JWT token for salesperson (with optional permanent session for master)
async function createSalespersonToken(salespersonId: number, isPermanent: boolean = false): Promise<string> {
  const jwtBuilder = new jose.SignJWT({ salespersonId, isMaster: isPermanent })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt();
  
  if (isPermanent) {
    jwtBuilder.setExpirationTime('1y');
  } else {
    const endOfDay = getEndOfDay();
    jwtBuilder.setExpirationTime(endOfDay);
  }
  
  return jwtBuilder.sign(getJwtSecret());
}

// Verify JWT token and return payload
async function verifySalespersonToken(token: string): Promise<{ salespersonId: number; isMaster: boolean } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getJwtSecret());
    return {
      salespersonId: payload.salespersonId as number,
      isMaster: payload.isMaster as boolean || false,
    };
  } catch {
    return null;
  }
}

// Helper to get salesperson from request context (exported for use in other routers)
export async function getSalespersonFromContext(ctx: any): Promise<{ id: number; isMaster: boolean } | null> {
  let token = ctx.req.cookies?.[SALESPERSON_COOKIE_NAME];
  const authHeader = ctx.req.headers.authorization;
  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }
  if (!token) return null;
  
  const payload = await verifySalespersonToken(token);
  if (!payload) return null;
  
  return { id: payload.salespersonId, isMaster: payload.isMaster };
}

// tRPC router
export const salespersonRouter = router({
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const isMaster = input.email.toLowerCase() === MASTER_EMAIL.toLowerCase();
      
      if (isMaster) {
        if (input.password !== MASTER_PASSWORD) {
          return { success: false, error: "Senha incorreta" };
        }
        const token = await createSalespersonToken(-1, true);
        return {
          success: true,
          token,
          isMaster: true,
          salesperson: { id: -1, name: "Master Admin", email: MASTER_EMAIL, phone: "" },
        };
      }
      
      if (input.password !== SALESPERSON_PASSWORD) {
        return { success: false, error: "Senha incorreta" };
      }

      const salesperson = await getSalespersonByEmail(input.email);
      if (!salesperson) {
        return { success: false, error: "E-mail não encontrado" };
      }

      if (!salesperson.isActive) {
        return { success: false, error: "Usuário inativo" };
      }

      const token = await createSalespersonToken(salesperson.id, false);
      const endOfDay = getEndOfDay();

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(SALESPERSON_COOKIE_NAME, token, {
        ...cookieOptions,
        expires: endOfDay,
      });

      return {
        success: true,
        token,
        salesperson: {
          id: salesperson.id,
          name: salesperson.name,
          email: salesperson.email,
          phone: salesperson.phone,
        },
      };
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(SALESPERSON_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),

  me: publicProcedure.query(async ({ ctx }) => {
    let token = ctx.req.cookies?.[SALESPERSON_COOKIE_NAME];
    const authHeader = ctx.req.headers.authorization;
    if (!token && authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
    if (!token) return null;

    const payload = await verifySalespersonToken(token);
    if (payload === null) return null;

    if (payload.salespersonId === -1) {
      return { id: -1, name: "Master Admin", email: MASTER_EMAIL, phone: "", isMaster: true };
    }

    const salesperson = await getSalespersonById(payload.salespersonId);
    if (!salesperson || !salesperson.isActive) return null;

    return {
      id: salesperson.id,
      name: salesperson.name,
      email: salesperson.email,
      phone: salesperson.phone,
      isMaster: false,
    };
  }),

  list: publicProcedure.query(async () => {
    const salespeople = await getAllSalespeople();
    return salespeople.map(s => ({
      id: s.id, name: s.name, email: s.email, phone: s.phone,
    }));
  }),
});
