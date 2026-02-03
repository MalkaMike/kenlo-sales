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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileText, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Lista de vendedores
const VENDORS = [
  "AMANDA DE OLIVEIRA MATOS",
  "BRUNO RIBEIRO DA SILVA",
  "CASSIA MOREIRA BARBOSA",
  "EMERSON DE MORAES",
  "IVAN KERR CODO",
  "JAQUELINE SILVA GRANELLI",
  "LARISSA BRANDALISE FAVI",
  "MARINA KIYOMI YOKOMUN",
  "YR MADEIRAS DE GASPERIN",
  "ROBERTA PACHECO DE AZEVEDO",
];

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
  const [openVendorCombobox, setOpenVendorCombobox] = useState(false);

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
            <Popover open={openVendorCombobox} onOpenChange={setOpenVendorCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openVendorCombobox}
                  className="w-full justify-between"
                  disabled={isExporting}
                >
                  {salesPersonName || "Selecione ou digite o nome do vendedor"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Buscar vendedor..." 
                    value={salesPersonName}
                    onValueChange={setSalesPersonName}
                  />
                  <CommandList>
                    <CommandEmpty>Nenhum vendedor encontrado.</CommandEmpty>
                    <CommandGroup>
                      {VENDORS.filter((vendor) =>
                        vendor.toLowerCase().includes(salesPersonName.toLowerCase())
                      ).map((vendor) => (
                        <CommandItem
                          key={vendor}
                          value={vendor}
                          onSelect={(currentValue) => {
                            setSalesPersonName(currentValue === salesPersonName ? "" : vendor);
                            setOpenVendorCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              salesPersonName === vendor ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {vendor}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
