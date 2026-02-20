/**
 * PricingUpdateBanner
 *
 * Polls the server for pricing version changes and shows a non-intrusive
 * banner when the admin has updated pricing-values.json, prompting the
 * user to reload the page so the calculator picks up fresh values.
 */

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 30_000; // check every 30 seconds

export function PricingUpdateBanner() {
  const [initialVersion, setInitialVersion] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const versionQuery = trpc.pricingAdmin.getVersion.useQuery(undefined, {
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    staleTime: POLL_INTERVAL_MS - 5000,
  });

  useEffect(() => {
    if (!versionQuery.data) return;
    const currentVersion = versionQuery.data.version;

    if (initialVersion === null) {
      // First load — store the baseline version
      setInitialVersion(currentVersion);
    } else if (currentVersion !== initialVersion && currentVersion !== "unknown") {
      // Version changed — show banner
      setShowBanner(true);
    }
  }, [versionQuery.data, initialVersion]);

  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-50 border-b border-amber-200 shadow-sm animate-in slide-in-from-top duration-300">
      <div className="container max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-900">
              Preços atualizados pelo administrador
            </p>
            <p className="text-xs text-amber-700">
              Recarregue a página para ver os novos valores na calculadora.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
            onClick={() => setDismissed(true)}
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Depois
          </Button>
          <Button
            size="sm"
            className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Recarregar Agora
          </Button>
        </div>
      </div>
    </div>
  );
}
