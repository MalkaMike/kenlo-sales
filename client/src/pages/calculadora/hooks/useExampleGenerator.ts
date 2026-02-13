/**
 * useExampleGenerator - Generates 3 random example PDFs for demonstration
 * Extracted from useCalculadora for better modularity
 */

import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  type ProductSelection,
  type PlanTier,
  type PaymentFrequency,
  PLAN_ANNUAL_PRICES,
  ADDON_ANNUAL_PRICES,
  PAYMENT_FREQUENCY_MULTIPLIERS,
  roundToEndIn7,
  calculateAdditionalUsersCost,
} from "../types";

// ─── Random Helpers ──────────────────────────────────────────────────────────

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randBool = () => Math.random() > 0.5;

// ─── Static Data ─────────────────────────────────────────────────────────────

const COMPANY_NAMES = [
  "Imobiliária Sol Nascente", "Rede Imóveis Premium", "Casa & Lar Imóveis",
  "Horizonte Imobiliária", "Ponto Certo Imóveis", "Alpha Gestão Imobiliária",
  "Morada Real Imóveis", "Viva Imóveis", "Central Imobiliária", "Top House Imóveis",
];

const OWNER_NAMES = [
  "Carlos Mendes", "Ana Beatriz Costa", "Roberto Almeida",
  "Fernanda Oliveira", "Marcos Pereira", "Juliana Santos",
  "Pedro Henrique Lima", "Camila Rodrigues", "Lucas Ferreira",
];

const FREQUENCIES: PaymentFrequency[] = ["monthly", "semestral", "annual", "biennial"];
const BUSINESS_TYPES = ["broker", "rental_admin", "both"] as const;

const KOMBO_CONFIGS = [
  { product: "imob" as ProductSelection, addons: ["leads", "assinatura"], komboId: "imob_start", komboName: "Kombo Imob Start", discount: 10 },
  { product: "imob" as ProductSelection, addons: ["leads", "inteligencia", "assinatura"], komboId: "imob_pro", komboName: "Kombo Imob Pro", discount: 15 },
  { product: "loc" as ProductSelection, addons: ["inteligencia", "assinatura"], komboId: "locacao_pro", komboName: "Kombo Locação Pro", discount: 10 },
  { product: "both" as ProductSelection, addons: [] as string[], komboId: "core_gestao", komboName: "Kombo Core Gestão", discount: 0 },
  { product: "both" as ProductSelection, addons: ["leads", "inteligencia", "assinatura", "pay", "seguros"], komboId: "elite", komboName: "Kombo Elite", discount: 20 },
  { product: "imob" as ProductSelection, addons: ["leads"], komboId: null as string | null, komboName: undefined as string | undefined, discount: 0 },
  { product: "loc" as ProductSelection, addons: ["pay", "seguros"], komboId: null as string | null, komboName: undefined as string | undefined, discount: 0 },
  { product: "both" as ProductSelection, addons: ["leads", "assinatura", "pay"], komboId: null as string | null, komboName: undefined as string | undefined, discount: 0 },
];

// ─── Plan Recommendation Helpers ─────────────────────────────────────────────

function planForImobUsers(users: number): PlanTier {
  if (users <= 4) return "prime";
  if (users <= 15) return "k";
  return "k2";
}

function planForLocContracts(contracts: number): PlanTier {
  if (contracts <= 199) return "prime";
  if (contracts <= 499) return "k";
  return "k2";
}

// ─── Post-Paid Breakdown Builder ─────────────────────────────────────────────

interface PostPaidBreakdownGroup {
  groupLabel: string;
  groupTotal: number;
  items: Array<{
    label: string;
    included: number;
    additional: number;
    total: number;
    perUnit: number;
    unitLabel: string;
  }>;
}

interface PostPaidBreakdown {
  total: number;
  imobAddons?: PostPaidBreakdownGroup;
  locAddons?: PostPaidBreakdownGroup;
  sharedAddons?: PostPaidBreakdownGroup;
}

function buildExamplePostPaid(
  config: typeof KOMBO_CONFIGS[0],
  iplan: PlanTier,
  lplan: PlanTier,
  imobUsers: number,
  contracts: number,
  closings: number,
  newContracts: number,
  leadsMonth: number,
  wantsWA: boolean,
  chargesBoleto: boolean,
  chargesSplit: boolean,
): PostPaidBreakdown {
  let postPaidTotal = 0;
  const ppBreakdown: PostPaidBreakdown = { total: 0 };

  // IMOB: Additional Users
  if (config.product === "imob" || config.product === "both") {
    const included = iplan === "prime" ? 2 : iplan === "k" ? 5 : 10;
    const additional = Math.max(0, imobUsers - included);
    if (additional > 0) {
      const userCost = calculateAdditionalUsersCost(iplan, additional);
      postPaidTotal += userCost;
      if (!ppBreakdown.imobAddons) ppBreakdown.imobAddons = { groupLabel: "IMOB", groupTotal: 0, items: [] };
      ppBreakdown.imobAddons.items.push({ label: "Usuários Adicionais", included, additional, total: userCost, perUnit: iplan === "prime" ? 57 : iplan === "k" ? 47 : 37, unitLabel: "usuário" });
      ppBreakdown.imobAddons.groupTotal += userCost;
    }
  }

  // LOC: Additional Contracts
  if (config.product === "loc" || config.product === "both") {
    const included = lplan === "prime" ? 100 : lplan === "k" ? 150 : 500;
    const additional = Math.max(0, contracts - included);
    if (additional > 0) {
      let contractCost = 0;
      if (lplan === "prime") contractCost = additional * 3;
      else if (lplan === "k") { const t1 = Math.min(additional, 250); const t2 = Math.max(0, additional - 250); contractCost = t1 * 3 + t2 * 2.5; }
      else { const t1 = Math.min(additional, 250); const t2 = Math.min(Math.max(0, additional - 250), 250); const t3 = Math.max(0, additional - 500); contractCost = t1 * 3 + t2 * 2.5 + t3 * 2; }
      postPaidTotal += contractCost;
      if (!ppBreakdown.locAddons) ppBreakdown.locAddons = { groupLabel: "LOCAÇÃO", groupTotal: 0, items: [] };
      ppBreakdown.locAddons.items.push({ label: "Contratos Adicionais", included, additional, total: contractCost, perUnit: 3, unitLabel: "contrato" });
      ppBreakdown.locAddons.groupTotal += contractCost;
    }

    if (chargesBoleto && config.addons.includes("pay")) {
      const inclBoletos = lplan === "prime" ? 2 : lplan === "k" ? 5 : 15;
      const addBoletos = Math.max(0, contracts - inclBoletos);
      if (addBoletos > 0) {
        let boletoCost = 0;
        if (lplan === "prime") boletoCost = addBoletos * 4;
        else if (lplan === "k") { const bt1 = Math.min(addBoletos, 250); const bt2 = Math.max(0, addBoletos - 250); boletoCost = bt1 * 4 + bt2 * 3.5; }
        else { const bt1 = Math.min(addBoletos, 250); const bt2 = Math.min(Math.max(0, addBoletos - 250), 250); const bt3 = Math.max(0, addBoletos - 500); boletoCost = bt1 * 4 + bt2 * 3.5 + bt3 * 3; }
        postPaidTotal += boletoCost;
        if (!ppBreakdown.locAddons) ppBreakdown.locAddons = { groupLabel: "LOCAÇÃO", groupTotal: 0, items: [] };
        ppBreakdown.locAddons.items.push({ label: "Custo Boletos (Pay)", included: inclBoletos, additional: addBoletos, total: boletoCost, perUnit: 4, unitLabel: "boleto" });
        ppBreakdown.locAddons.groupTotal += boletoCost;
      }
    }

    if (chargesSplit && config.addons.includes("pay")) {
      const inclSplits = lplan === "prime" ? 2 : lplan === "k" ? 5 : 15;
      const addSplits = Math.max(0, contracts - inclSplits);
      if (addSplits > 0) {
        let splitCost = 0;
        if (lplan === "prime") splitCost = addSplits * 4;
        else if (lplan === "k") { const st1 = Math.min(addSplits, 250); const st2 = Math.max(0, addSplits - 250); splitCost = st1 * 4 + st2 * 3.5; }
        else { const st1 = Math.min(addSplits, 250); const st2 = Math.min(Math.max(0, addSplits - 250), 250); const st3 = Math.max(0, addSplits - 500); splitCost = st1 * 4 + st2 * 3.5 + st3 * 3; }
        postPaidTotal += splitCost;
        if (!ppBreakdown.locAddons) ppBreakdown.locAddons = { groupLabel: "LOCAÇÃO", groupTotal: 0, items: [] };
        ppBreakdown.locAddons.items.push({ label: "Custo Split (Pay)", included: inclSplits, additional: addSplits, total: splitCost, perUnit: 4, unitLabel: "split" });
        ppBreakdown.locAddons.groupTotal += splitCost;
      }
    }
  }

  // Shared: Digital Signatures
  if (config.addons.includes("assinatura")) {
    const included = 15;
    let totalSigs = 0;
    if (config.product === "imob" || config.product === "both") totalSigs += closings;
    if (config.product === "loc" || config.product === "both") totalSigs += newContracts;
    const additional = Math.max(0, totalSigs - included);
    if (additional > 0) {
      const st1 = Math.min(additional, 20); const st2 = Math.min(Math.max(0, additional - 20), 20); const st3 = Math.max(0, additional - 40);
      const sigCost = st1 * 1.8 + st2 * 1.7 + st3 * 1.5;
      postPaidTotal += sigCost;
      if (!ppBreakdown.sharedAddons) ppBreakdown.sharedAddons = { groupLabel: "Add-ons Compartilhados (IMOB + LOC)", groupTotal: 0, items: [] };
      ppBreakdown.sharedAddons.items.push({ label: "Assinaturas Digitais (compartilhado)", included, additional, total: sigCost, perUnit: 1.8, unitLabel: "assinatura" });
      ppBreakdown.sharedAddons.groupTotal += sigCost;
    }
  }

  // WhatsApp Messages
  if (config.addons.includes("leads") && wantsWA) {
    const included = 100;
    const additional = Math.max(0, leadsMonth - included);
    if (additional > 0) {
      const wt1 = Math.min(additional, 200); const wt2 = Math.min(Math.max(0, additional - 200), 150); const wt3 = Math.min(Math.max(0, additional - 350), 650); const wt4 = Math.max(0, additional - 1000);
      const waCost = wt1 * 2 + wt2 * 1.8 + wt3 * 1.5 + wt4 * 1.2;
      postPaidTotal += waCost;
      if (!ppBreakdown.sharedAddons) ppBreakdown.sharedAddons = { groupLabel: "Add-ons Compartilhados (IMOB + LOC)", groupTotal: 0, items: [] };
      ppBreakdown.sharedAddons.items.push({ label: "Mensagens WhatsApp", included, additional, total: waCost, perUnit: 2, unitLabel: "msg" });
      ppBreakdown.sharedAddons.groupTotal += waCost;
    }
  }

  ppBreakdown.total = postPaidTotal;
  return ppBreakdown;
}

// ─── Single Example Builder ──────────────────────────────────────────────────

function buildExampleProposalData() {
  const config = pick(KOMBO_CONFIGS);
  const freq = pick(FREQUENCIES);
  const company = pick(COMPANY_NAMES);
  const owner = pick(OWNER_NAMES);
  const bizType = pick([...BUSINESS_TYPES]);

  const imobUsers = randInt(2, 30);
  const closings = randInt(2, 20);
  const leadsMonth = randInt(50, 500);
  const contracts = randInt(50, 800);
  const newContracts = randInt(2, 25);

  const iplan = planForImobUsers(imobUsers);
  const lplan = planForLocContracts(contracts);
  const wantsWA = config.addons.includes("leads") ? randBool() : false;
  const chargesBoleto = config.addons.includes("pay") ? randBool() : false;
  const chargesSplit = config.addons.includes("pay") ? randBool() : false;
  const boletoAmt = chargesBoleto ? pick([5, 7.5, 8.5, 10, 12]) : 0;
  const splitAmt = chargesSplit ? pick([5, 8, 10, 12, 15]) : 0;

  const freqMult = PAYMENT_FREQUENCY_MULTIPLIERS[freq];
  const discountMult = config.komboId ? (1 - config.discount / 100) : 1;

  // Calculate monthly totals
  let totalMonthly = 0;
  if (config.product === "imob" || config.product === "both") {
    totalMonthly += roundToEndIn7(PLAN_ANNUAL_PRICES[iplan] * freqMult * discountMult);
  }
  if (config.product === "loc" || config.product === "both") {
    totalMonthly += roundToEndIn7(PLAN_ANNUAL_PRICES[lplan] * freqMult * discountMult);
  }
  for (const addon of config.addons) {
    const addonPrice = ADDON_ANNUAL_PRICES[addon as keyof typeof ADDON_ANNUAL_PRICES] || 0;
    if (addonPrice > 0) {
      totalMonthly += roundToEndIn7(addonPrice * freqMult * discountMult);
    }
  }

  const totalAnnual = totalMonthly * 12;
  const implantationFee = config.komboId ? 1497 : (
    (config.product === "imob" || config.product === "both" ? 1497 : 0) +
    (config.product === "loc" || config.product === "both" ? 1497 : 0)
  );
  const firstYearTotal = totalAnnual + implantationFee;

  // Calculate individual prices
  let imobPrice = 0;
  let locPrice = 0;
  const addonPricesObj: Record<string, number> = {};

  if (config.product === "imob" || config.product === "both") {
    imobPrice = roundToEndIn7(PLAN_ANNUAL_PRICES[iplan] * freqMult * discountMult);
  }
  if (config.product === "loc" || config.product === "both") {
    locPrice = roundToEndIn7(PLAN_ANNUAL_PRICES[lplan] * freqMult * discountMult);
  }
  for (const addon of config.addons) {
    const ap = ADDON_ANNUAL_PRICES[addon as keyof typeof ADDON_ANNUAL_PRICES] || 0;
    if (ap > 0) {
      addonPricesObj[addon] = roundToEndIn7(ap * freqMult * discountMult);
    }
  }

  // Post-paid breakdown
  const ppBreakdown = buildExamplePostPaid(
    config, iplan, lplan, imobUsers, contracts,
    closings, newContracts, leadsMonth, wantsWA,
    chargesBoleto, chargesSplit,
  );
  const postPaidTotal = ppBreakdown.total;

  // Revenue calculations
  const revenueFromBoletos = (chargesBoleto || chargesSplit) && (config.product === "loc" || config.product === "both")
    ? contracts * (boletoAmt + splitAmt) : 0;
  const revenueFromInsurance = config.addons.includes("seguros") && (config.product === "loc" || config.product === "both")
    ? contracts * 10 : 0;
  const netGain = revenueFromBoletos + revenueFromInsurance - totalMonthly - postPaidTotal;

  const installments = pick([1, 2, 3]);

  return {
    proposalData: {
      salesPersonName: "Vendedor Exemplo",
      vendorEmail: "vendedor@kenlo.com.br",
      vendorPhone: "(11) 99999-0000",
      vendorRole: "Executivo(a) de Vendas",
      clientName: owner,
      agencyName: company,
      productType: config.product,
      komboName: config.komboName,
      komboDiscount: config.discount > 0 ? config.discount : undefined,
      imobPlan: (config.product === "imob" || config.product === "both") ? iplan : undefined,
      locPlan: (config.product === "loc" || config.product === "both") ? lplan : undefined,
      imobUsers,
      closings,
      contracts,
      newContracts,
      leadsPerMonth: leadsMonth,
      usesExternalAI: false,
      wantsWhatsApp: wantsWA,
      chargesSplitToOwner: chargesSplit,
      chargesBoletoToTenant: chargesBoleto,
      boletoAmount: boletoAmt,
      splitAmount: splitAmt,
      monthlyLicenseBase: totalMonthly,
      selectedAddons: JSON.stringify(config.addons),
      paymentPlan: freq,
      totalMonthly,
      totalAnnual,
      implantationFee,
      firstYearTotal,
      postPaidTotal,
      revenueFromBoletos,
      revenueFromInsurance,
      netGain,
      prepayAdditionalUsers: false,
      prepayAdditionalContracts: false,
      prepaymentUsersAmount: 0,
      prepaymentContractsAmount: 0,
      prepaymentMonths: 0,
      hasPremiumServices: !!config.komboId,
      premiumServicesPrice: 0,
      installments,
      businessType: bizType,
      imobPrice: imobPrice > 0 ? imobPrice : undefined,
      locPrice: locPrice > 0 ? locPrice : undefined,
      addonPrices: Object.keys(addonPricesObj).length > 0 ? JSON.stringify(addonPricesObj) : undefined,
      vipIncluded: !!config.komboId,
      csIncluded: !!config.komboId,
      vipPrice: 0,
      csPrice: 0,
      postPaidBreakdown: JSON.stringify(ppBreakdown),
    },
    company,
    komboId: config.komboId,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseExampleGeneratorParams {
  canExportPDF: boolean;
  generatePDF: { mutateAsync: (data: any) => Promise<{ success: boolean; pdf?: string }> };
}

export function useExampleGenerator({ canExportPDF, generatePDF }: UseExampleGeneratorParams) {
  const [isGeneratingExamples, setIsGeneratingExamples] = useState(false);

  const handleGenerate3Examples = useCallback(async () => {
    if (!canExportPDF) {
      toast.error("Faça login como vendedor autorizado para gerar exemplos.");
      return;
    }
    setIsGeneratingExamples(true);
    toast.loading("Gerando 3 exemplos aleatórios...");

    let successCount = 0;

    for (let i = 0; i < 3; i++) {
      try {
        const { proposalData, company, komboId } = buildExampleProposalData();

        const pdfResult = await generatePDF.mutateAsync(proposalData);

        if (pdfResult.success && pdfResult.pdf) {
          const pdfBlob = new Blob(
            [Uint8Array.from(atob(pdfResult.pdf), (c) => c.charCodeAt(0))],
            { type: "application/pdf" }
          );
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Exemplo_${i + 1}_${company.replace(/\s+/g, "_")}_${komboId || "sem_kombo"}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          successCount++;
        }

        if (i < 2) await new Promise(r => setTimeout(r, 1500));
      } catch (error) {
        console.error(`Erro ao gerar exemplo ${i + 1}:`, error);
      }
    }

    toast.dismiss();
    setIsGeneratingExamples(false);

    if (successCount === 3) {
      toast.success(`${successCount} PDFs de exemplo gerados com sucesso!`);
    } else if (successCount > 0) {
      toast.success(`${successCount} de 3 PDFs gerados. Alguns falharam.`);
    } else {
      toast.error("Falha ao gerar exemplos. Verifique o login.");
    }
  }, [canExportPDF, generatePDF]);

  return {
    isGeneratingExamples,
    handleGenerate3Examples,
  };
}
