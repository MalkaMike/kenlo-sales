import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Loader2 } from "lucide-react";

interface ProposalExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (salesPersonName: string, clientName: string) => Promise<void>;
}

export function ProposalExportDialog({
  open,
  onOpenChange,
  onExport,
}: ProposalExportDialogProps) {
  const [salesPersonName, setSalesPersonName] = useState("");
  const [clientName, setClientName] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!salesPersonName.trim() || !clientName.trim()) {
      return;
    }

    setIsExporting(true);
    try {
      await onExport(salesPersonName.trim(), clientName.trim());
      // Reset form after successful export
      setSalesPersonName("");
      setClientName("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error exporting proposal:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const canExport = salesPersonName.trim() && clientName.trim() && !isExporting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Exportar Proposta em PDF</DialogTitle>
          </div>
          <DialogDescription>
            Preencha os dados abaixo para gerar a proposta. Todos os dados serão salvos no sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="salesPersonName">
              Nome do Vendedor <span className="text-destructive">*</span>
            </Label>
            <Input
              id="salesPersonName"
              placeholder="Digite seu nome completo"
              value={salesPersonName}
              onChange={(e) => setSalesPersonName(e.target.value)}
              disabled={isExporting}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientName">
              Nome do Cliente <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clientName"
              placeholder="Digite o nome do cliente ou imobiliária"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              disabled={isExporting}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canExport) {
                  handleExport();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={!canExport}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Gerar PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
