/**
 * Client-side global error interceptor for tRPC API errors.
 * Extracts structured error data from the server's error formatter
 * and dispatches user-friendly notifications via the NotificationContext.
 *
 * This module provides a setup function that subscribes to the
 * QueryClient's query and mutation caches to intercept all errors globally.
 */

import type { QueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import type { AppErrorShape } from "@shared/errorTypes";
import { NETWORK_ERROR, TIMEOUT_ERROR, UNKNOWN_ERROR } from "@shared/errorTypes";

type NotifyFn = (
  type: "success" | "error" | "warning" | "info",
  title: string,
  message?: string,
  options?: { duration?: number; action?: { label: string; onClick: () => void } }
) => string;

/**
 * Extract the appError shape from a tRPC error, if present.
 */
function extractAppError(error: unknown): AppErrorShape | null {
  if (!(error instanceof TRPCClientError)) return null;

  // The server error formatter attaches appError to data
  const data = error.data as Record<string, unknown> | undefined;
  if (data && typeof data === "object" && "appError" in data) {
    return data.appError as AppErrorShape;
  }
  return null;
}

/**
 * Determine if an error is a network/connectivity issue.
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TRPCClientError) {
    const cause = error.cause;
    if (cause instanceof TypeError && cause.message.includes("fetch")) return true;
    if (error.message.includes("Failed to fetch")) return true;
    if (error.message.includes("NetworkError")) return true;
    if (error.message.includes("Network request failed")) return true;
  }
  return false;
}

/**
 * Determine if an error is a timeout.
 */
function isTimeoutError(error: unknown): boolean {
  if (error instanceof TRPCClientError) {
    if (error.message.includes("timeout")) return true;
    if (error.message.includes("AbortError")) return true;
  }
  return false;
}

/**
 * Determine if an error is an auth error that should redirect to login.
 */
function isAuthRedirectError(error: unknown): boolean {
  if (!(error instanceof TRPCClientError)) return false;
  return error.message === UNAUTHED_ERR_MSG;
}

/** Track recently shown error messages to avoid duplicates */
const recentErrors = new Map<string, number>();
const DEDUP_WINDOW_MS = 3000;

function isDuplicate(key: string): boolean {
  const now = Date.now();
  const lastShown = recentErrors.get(key);
  if (lastShown && now - lastShown < DEDUP_WINDOW_MS) {
    return true;
  }
  recentErrors.set(key, now);
  // Clean up old entries
  recentErrors.forEach((v, k) => {
    if (now - v > DEDUP_WINDOW_MS * 2) recentErrors.delete(k);
  });
  return false;
}

/**
 * Handle an API error by dispatching the appropriate notification.
 */
function handleApiError(
  error: unknown,
  notify: NotifyFn,
  getLoginUrl: () => string,
  context: "query" | "mutation"
): void {
  // Auth errors: redirect to login (already handled by main.tsx, but we add a notification)
  if (isAuthRedirectError(error)) {
    // main.tsx handles the redirect; we skip notification to avoid flash
    return;
  }

  // Network errors
  if (isNetworkError(error)) {
    const key = "network-error";
    if (isDuplicate(key)) return;
    notify("warning", NETWORK_ERROR.title, NETWORK_ERROR.message, {
      duration: 8000,
      action: {
        label: "Tentar novamente",
        onClick: () => window.location.reload(),
      },
    });
    return;
  }

  // Timeout errors
  if (isTimeoutError(error)) {
    const key = "timeout-error";
    if (isDuplicate(key)) return;
    notify("warning", TIMEOUT_ERROR.title, TIMEOUT_ERROR.message, {
      duration: 6000,
      action: {
        label: "Tentar novamente",
        onClick: () => window.location.reload(),
      },
    });
    return;
  }

  // Structured server errors (from our error formatter)
  const appError = extractAppError(error);
  if (appError) {
    const key = `${appError.code}-${appError.userTitle}`;
    if (isDuplicate(key)) return;

    // Auth errors get a warning with login action
    if (appError.isAuthError) {
      notify("warning", appError.userTitle, appError.userMessage, {
        duration: 8000,
        action: {
          label: "Fazer login",
          onClick: () => {
            window.location.href = getLoginUrl();
          },
        },
      });
      return;
    }

    // Retryable errors get a retry action
    if (appError.isRetryable) {
      notify("error", appError.userTitle, appError.userMessage, {
        duration: 8000,
        action: {
          label: "Tentar novamente",
          onClick: () => window.location.reload(),
        },
      });
      return;
    }

    // Standard errors
    notify("error", appError.userTitle, appError.userMessage, {
      duration: 6000,
    });
    return;
  }

  // Fallback for unstructured errors
  if (error instanceof TRPCClientError) {
    const key = `trpc-${error.message}`;
    if (isDuplicate(key)) return;

    // Don't show notification for errors that are likely handled locally
    // (e.g., form validation errors caught by the component)
    if (context === "mutation") {
      // Mutations are often handled locally; only show for unhandled ones
      notify("error", UNKNOWN_ERROR.title, UNKNOWN_ERROR.message, {
        duration: 5000,
      });
    }
    return;
  }

  // Non-tRPC errors (very rare)
  const key = `unknown-${String(error)}`;
  if (isDuplicate(key)) return;
  notify("error", UNKNOWN_ERROR.title, UNKNOWN_ERROR.message, {
    duration: 5000,
  });
}

/**
 * Set up global error interception on the QueryClient.
 * Call this once during app initialization.
 *
 * @param queryClient - The React Query client
 * @param notify - The notification dispatch function
 * @param getLoginUrl - Function that returns the login URL
 */
export function setupErrorInterceptor(
  queryClient: QueryClient,
  notify: NotifyFn,
  getLoginUrl: () => string
): () => void {
  const unsubQuery = queryClient.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.action.type === "error") {
      const error = event.query.state.error;
      handleApiError(error, notify, getLoginUrl, "query");
    }
  });

  const unsubMutation = queryClient.getMutationCache().subscribe((event) => {
    if (event.type === "updated" && event.action.type === "error") {
      const error = event.mutation.state.error;
      handleApiError(error, notify, getLoginUrl, "mutation");
    }
  });

  return () => {
    unsubQuery();
    unsubMutation();
  };
}
