/**
 * Shared error types for client-server communication
 * These types are used by both the server error formatter
 * and the client error interceptor.
 */

export interface AppErrorShape {
  code: string;
  userTitle: string;
  userMessage: string;
  isRetryable: boolean;
  isAuthError: boolean;
}

/** Network error messages in PT-BR */
export const NETWORK_ERROR = {
  title: "Erro de conexão",
  message: "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.",
} as const;

/** Timeout error messages in PT-BR */
export const TIMEOUT_ERROR = {
  title: "Tempo esgotado",
  message: "A operação demorou demais para responder. Tente novamente.",
} as const;

/** Unknown error messages in PT-BR */
export const UNKNOWN_ERROR = {
  title: "Erro inesperado",
  message: "Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.",
} as const;
