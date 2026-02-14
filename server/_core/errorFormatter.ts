/**
 * Server-side error formatter for tRPC
 * Maps tRPC error codes to user-friendly Portuguese messages
 * and adds structured error metadata for the client.
 */

import type { TRPCError } from "@trpc/server";

/** Error codes mapped to user-friendly PT-BR messages */
const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  BAD_REQUEST: {
    title: "Dados inválidos",
    message: "Verifique os dados informados e tente novamente.",
  },
  UNAUTHORIZED: {
    title: "Sessão expirada",
    message: "Sua sessão expirou. Faça login novamente para continuar.",
  },
  FORBIDDEN: {
    title: "Acesso negado",
    message: "Você não tem permissão para realizar esta ação.",
  },
  NOT_FOUND: {
    title: "Não encontrado",
    message: "O recurso solicitado não foi encontrado.",
  },
  TIMEOUT: {
    title: "Tempo esgotado",
    message: "A operação demorou demais. Tente novamente.",
  },
  CONFLICT: {
    title: "Conflito de dados",
    message: "Houve um conflito com os dados existentes. Atualize a página e tente novamente.",
  },
  PRECONDITION_FAILED: {
    title: "Pré-condição falhou",
    message: "As condições necessárias para esta operação não foram atendidas.",
  },
  PAYLOAD_TOO_LARGE: {
    title: "Arquivo muito grande",
    message: "O arquivo enviado excede o tamanho máximo permitido.",
  },
  METHOD_NOT_SUPPORTED: {
    title: "Método não suportado",
    message: "Esta operação não é suportada.",
  },
  UNPROCESSABLE_CONTENT: {
    title: "Conteúdo inválido",
    message: "Não foi possível processar os dados enviados. Verifique e tente novamente.",
  },
  TOO_MANY_REQUESTS: {
    title: "Muitas requisições",
    message: "Você fez muitas requisições. Aguarde um momento e tente novamente.",
  },
  CLIENT_CLOSED_REQUEST: {
    title: "Requisição cancelada",
    message: "A requisição foi cancelada. Tente novamente.",
  },
  INTERNAL_SERVER_ERROR: {
    title: "Erro interno",
    message: "Ocorreu um erro inesperado no servidor. Tente novamente em alguns instantes.",
  },
  PARSE_ERROR: {
    title: "Erro de comunicação",
    message: "Houve um erro na comunicação com o servidor. Tente novamente.",
  },
};

/**
 * Get user-friendly error info from a tRPC error code
 */
export function getUserFriendlyError(code: string): { title: string; message: string } {
  return (
    ERROR_MESSAGES[code] ?? {
      title: "Erro inesperado",
      message: "Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.",
    }
  );
}

/**
 * Structured error shape returned to the client
 */
export interface AppErrorShape {
  code: string;
  userTitle: string;
  userMessage: string;
  isRetryable: boolean;
  isAuthError: boolean;
}

/** Error codes that the user can retry */
const RETRYABLE_CODES = new Set([
  "TIMEOUT",
  "INTERNAL_SERVER_ERROR",
  "TOO_MANY_REQUESTS",
  "CLIENT_CLOSED_REQUEST",
  "PARSE_ERROR",
]);

/** Error codes related to authentication */
const AUTH_CODES = new Set(["UNAUTHORIZED", "FORBIDDEN"]);

/**
 * Build structured error metadata from a tRPC error
 */
export function buildErrorShape(error: TRPCError): AppErrorShape {
  const friendly = getUserFriendlyError(error.code);
  return {
    code: error.code,
    userTitle: friendly.title,
    userMessage: friendly.message,
    isRetryable: RETRYABLE_CODES.has(error.code),
    isAuthError: AUTH_CODES.has(error.code),
  };
}
