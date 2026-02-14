import { describe, it, expect } from "vitest";
import { TRPCError } from "@trpc/server";
import { getUserFriendlyError, buildErrorShape } from "./_core/errorFormatter";

describe("Error Formatter", () => {
  describe("getUserFriendlyError", () => {
    it("should return PT-BR message for BAD_REQUEST", () => {
      const result = getUserFriendlyError("BAD_REQUEST");
      expect(result.title).toBe("Dados inválidos");
      expect(result.message).toContain("Verifique os dados");
    });

    it("should return PT-BR message for UNAUTHORIZED", () => {
      const result = getUserFriendlyError("UNAUTHORIZED");
      expect(result.title).toBe("Sessão expirada");
      expect(result.message).toContain("sessão expirou");
    });

    it("should return PT-BR message for FORBIDDEN", () => {
      const result = getUserFriendlyError("FORBIDDEN");
      expect(result.title).toBe("Acesso negado");
      expect(result.message).toContain("permissão");
    });

    it("should return PT-BR message for NOT_FOUND", () => {
      const result = getUserFriendlyError("NOT_FOUND");
      expect(result.title).toBe("Não encontrado");
    });

    it("should return PT-BR message for INTERNAL_SERVER_ERROR", () => {
      const result = getUserFriendlyError("INTERNAL_SERVER_ERROR");
      expect(result.title).toBe("Erro interno");
      expect(result.message).toContain("erro inesperado");
    });

    it("should return PT-BR message for TOO_MANY_REQUESTS", () => {
      const result = getUserFriendlyError("TOO_MANY_REQUESTS");
      expect(result.title).toBe("Muitas requisições");
      expect(result.message).toContain("Aguarde");
    });

    it("should return PT-BR message for TIMEOUT", () => {
      const result = getUserFriendlyError("TIMEOUT");
      expect(result.title).toBe("Tempo esgotado");
    });

    it("should return PT-BR message for CONFLICT", () => {
      const result = getUserFriendlyError("CONFLICT");
      expect(result.title).toBe("Conflito de dados");
    });

    it("should return PT-BR message for PAYLOAD_TOO_LARGE", () => {
      const result = getUserFriendlyError("PAYLOAD_TOO_LARGE");
      expect(result.title).toBe("Arquivo muito grande");
    });

    it("should return PT-BR message for PARSE_ERROR", () => {
      const result = getUserFriendlyError("PARSE_ERROR");
      expect(result.title).toBe("Erro de comunicação");
    });

    it("should return fallback message for unknown error code", () => {
      const result = getUserFriendlyError("SOME_UNKNOWN_CODE");
      expect(result.title).toBe("Erro inesperado");
      expect(result.message).toContain("erro inesperado");
    });
  });

  describe("buildErrorShape", () => {
    it("should build correct shape for BAD_REQUEST", () => {
      const error = new TRPCError({ code: "BAD_REQUEST", message: "Invalid input" });
      const shape = buildErrorShape(error);

      expect(shape.code).toBe("BAD_REQUEST");
      expect(shape.userTitle).toBe("Dados inválidos");
      expect(shape.isRetryable).toBe(false);
      expect(shape.isAuthError).toBe(false);
    });

    it("should mark UNAUTHORIZED as auth error", () => {
      const error = new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      const shape = buildErrorShape(error);

      expect(shape.isAuthError).toBe(true);
      expect(shape.isRetryable).toBe(false);
    });

    it("should mark FORBIDDEN as auth error", () => {
      const error = new TRPCError({ code: "FORBIDDEN", message: "No access" });
      const shape = buildErrorShape(error);

      expect(shape.isAuthError).toBe(true);
      expect(shape.isRetryable).toBe(false);
    });

    it("should mark INTERNAL_SERVER_ERROR as retryable", () => {
      const error = new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Server crash" });
      const shape = buildErrorShape(error);

      expect(shape.isRetryable).toBe(true);
      expect(shape.isAuthError).toBe(false);
    });

    it("should mark TIMEOUT as retryable", () => {
      const error = new TRPCError({ code: "TIMEOUT", message: "Timed out" });
      const shape = buildErrorShape(error);

      expect(shape.isRetryable).toBe(true);
    });

    it("should mark TOO_MANY_REQUESTS as retryable", () => {
      const error = new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Rate limited" });
      const shape = buildErrorShape(error);

      expect(shape.isRetryable).toBe(true);
    });

    it("should mark PARSE_ERROR as retryable", () => {
      const error = new TRPCError({ code: "PARSE_ERROR", message: "Parse failed" });
      const shape = buildErrorShape(error);

      expect(shape.isRetryable).toBe(true);
    });

    it("should mark NOT_FOUND as neither retryable nor auth", () => {
      const error = new TRPCError({ code: "NOT_FOUND", message: "Resource missing" });
      const shape = buildErrorShape(error);

      expect(shape.isRetryable).toBe(false);
      expect(shape.isAuthError).toBe(false);
    });

    it("should mark CONFLICT as neither retryable nor auth", () => {
      const error = new TRPCError({ code: "CONFLICT", message: "Data conflict" });
      const shape = buildErrorShape(error);

      expect(shape.isRetryable).toBe(false);
      expect(shape.isAuthError).toBe(false);
    });

    it("should include user-friendly title and message in all shapes", () => {
      const codes = [
        "BAD_REQUEST", "UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND",
        "TIMEOUT", "CONFLICT", "INTERNAL_SERVER_ERROR", "PARSE_ERROR",
        "TOO_MANY_REQUESTS", "PAYLOAD_TOO_LARGE",
      ] as const;

      for (const code of codes) {
        const error = new TRPCError({ code, message: "test" });
        const shape = buildErrorShape(error);

        expect(shape.userTitle).toBeTruthy();
        expect(shape.userMessage).toBeTruthy();
        expect(shape.userTitle.length).toBeGreaterThan(3);
        expect(shape.userMessage.length).toBeGreaterThan(10);
      }
    });
  });
});
