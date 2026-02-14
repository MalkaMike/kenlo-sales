/**
 * ErrorInterceptorSetup
 *
 * This component wires the global tRPC error interceptor into the
 * NotificationContext. It must be rendered inside both the
 * QueryClientProvider and the NotificationProvider.
 *
 * It runs the setup once on mount and cleans up on unmount.
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNotification } from "@/hooks/useNotification";
import { setupErrorInterceptor } from "@/lib/errorInterceptor";
import { getLoginUrl } from "@/const";

export function ErrorInterceptorSetup() {
  const queryClient = useQueryClient();
  const { notify } = useNotification();

  useEffect(() => {
    const cleanup = setupErrorInterceptor(queryClient, notify, getLoginUrl);
    return cleanup;
  }, [queryClient, notify]);

  return null;
}
