/**
 * QuoteInfoHandler - QuoteInfoDialog with its PDF generation onSubmit handler
 * Extracted from CalculadoraPage.tsx (lines ~4145-4625)
 */

import { QuoteInfoDialog, type QuoteInfo } from "@/components/QuoteInfoDialog";
import { toast } from "sonner";
import { downloadProposalPDF } from "@/utils/generateProposalPDF";
import * as Pricing from "@/utils/pricing";
import { useCalc } from "./CalculadoraContext";
import {
  KOMBOS,
  PAYMENT_FREQUENCY_MULTIPLIERS,
  toNum,
  formatCurrency,
  roundToEndIn7,
  calculateAdditionalUsersCost,
} from "./types";

export function QuoteInfoHandler() {
  const {
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    frequency,
    activeKombo,
    komboInfo,
    prepayAdditionalUsers,
    prepayAdditionalContracts,
    businessNature,
    showQuoteInfoDialog,
    setShowQuoteInfoDialog,
    setPendingQuoteInfo,
    selectedPlans,
    selectedColumnsData,
    getLineItems,
    calculateTotalImplementation,
    calculatePrepaymentAmount,
    createProposal,
    saveQuoteMutation,
  } = useCalc();

  const handleSubmit = async (quoteInfo: QuoteInfo) => {
    setPendingQuoteInfo(quoteInfo);
    setShowQuoteInfoDialog(false);

    try {
      const toastId = toast.loading("Gerando PDF...");

      // Get selected addons as array (exclude Cash from PDFs per business rule)
      const selectedAddons = Object.entries(addons)
        .filter(([name, enabled]) => enabled && name !== "cash")
        .map(([name, _]) => name);

      // Calculate totals
      const items = getLineItems();
      const totalMonthly = items.reduce(
        (sum: number, item: any) =>
          sum + (activeKombo !== "none" ? item.priceComKombo : item.priceSemKombo),
        0
      );
      const totalAnnual = totalMonthly * 12;
      const implantationFee = calculateTotalImplementation(activeKombo !== "none");
      const firstYearTotal = totalAnnual + implantationFee;

      // Calculate post-paid total
      let postPaidTotal = 0;

      // Support Services
      if (product === "imob" || product === "both") {
        if (metrics.imobVipSupport && imobPlan === "prime")
          postPaidTotal += Pricing.getVipSupportPrice();
        if (metrics.imobDedicatedCS && imobPlan === "prime")
          postPaidTotal += Pricing.getCSDedicadoPrice();
      }
      if (product === "loc" || product === "both") {
        if (metrics.locVipSupport && locPlan === "prime")
          postPaidTotal += Pricing.getVipSupportPrice();
        if (metrics.locDedicatedCS && locPlan === "prime")
          postPaidTotal += Pricing.getCSDedicadoPrice();
      }

      // Additional Users (Imob) - Skip if prepaid (V9)
      if ((product === "imob" || product === "both") && !prepayAdditionalUsers) {
        const plan = imobPlan;
        const included = plan === "prime" ? 2 : plan === "k" ? 5 : 10;
        const additional = Math.max(0, toNum(metrics.imobUsers) - included);
        if (additional > 0) {
          postPaidTotal += calculateAdditionalUsersCost(plan, additional);
        }
      }

      // Additional Contracts (Loc) - Skip if prepaid (V9: K=150)
      if ((product === "loc" || product === "both") && !prepayAdditionalContracts) {
        const plan = locPlan;
        const included = plan === "prime" ? 100 : plan === "k" ? 150 : 500;
        const additional = Math.max(
          0,
          toNum(metrics.contractsUnderManagement) - included
        );
        if (additional > 0) {
          const tier1 = Math.min(additional, 250);
          const tier2 = Math.min(Math.max(0, additional - 250), 500);
          const tier3 = Math.max(0, additional - 750);
          postPaidTotal += tier1 * 3 + tier2 * 2.5 + tier3 * 2;
        }
      }

      // WhatsApp Messages (Leads)
      if (addons.leads && metrics.wantsWhatsApp) {
        const included = 100;
        const additional = Math.max(0, toNum(metrics.leadsPerMonth) - included);
        if (additional > 0) {
          const tier1 = Math.min(additional, 200);
          const tier2 = Math.min(Math.max(0, additional - 200), 150);
          const tier3 = Math.min(Math.max(0, additional - 350), 650);
          const tier4 = Math.max(0, additional - 1000);
          postPaidTotal += tier1 * 2.0 + tier2 * 1.8 + tier3 * 1.5 + tier4 * 1.2;
        }
      }

      // Digital Signatures (V9: 1-20=R$1.80, 21-40=R$1.70, 41+=R$1.50)
      if (addons.assinatura) {
        const included = 15;
        let totalSignatures = 0;
        if (product === "imob" || product === "both")
          totalSignatures += toNum(metrics.closingsPerMonth);
        if (product === "loc" || product === "both")
          totalSignatures += toNum(metrics.newContractsPerMonth);
        const additional = Math.max(0, totalSignatures - included);
        if (additional > 0) {
          const tier1 = Math.min(additional, 20);
          const tier2 = Math.min(Math.max(0, additional - 20), 20);
          const tier3 = Math.max(0, additional - 40);
          postPaidTotal += tier1 * 1.8 + tier2 * 1.7 + tier3 * 1.5;
        }
      }

      // Boleto costs (Pay)
      if (
        addons.pay &&
        metrics.chargesBoletoToTenant &&
        (product === "loc" || product === "both")
      ) {
        const plan = locPlan;
        const includedBoletos = plan === "prime" ? 2 : plan === "k" ? 5 : 15;
        const additionalBoletos = Math.max(
          0,
          toNum(metrics.contractsUnderManagement) - includedBoletos
        );
        if (additionalBoletos > 0) {
          if (plan === "prime") postPaidTotal += additionalBoletos * 4;
          else if (plan === "k") {
            const tier1 = Math.min(additionalBoletos, 250);
            const tier2 = Math.max(0, additionalBoletos - 250);
            postPaidTotal += tier1 * 4 + tier2 * 3.5;
          } else {
            const tier1 = Math.min(additionalBoletos, 250);
            const tier2 = Math.min(Math.max(0, additionalBoletos - 250), 250);
            const tier3 = Math.max(0, additionalBoletos - 500);
            postPaidTotal += tier1 * 4 + tier2 * 3.5 + tier3 * 3;
          }
        }
      }

      // Split costs (Pay)
      if (
        addons.pay &&
        metrics.chargesSplitToOwner &&
        (product === "loc" || product === "both")
      ) {
        const plan = locPlan;
        const includedSplits = plan === "prime" ? 2 : plan === "k" ? 5 : 15;
        const additionalSplits = Math.max(
          0,
          toNum(metrics.contractsUnderManagement) - includedSplits
        );
        if (additionalSplits > 0) {
          if (plan === "prime") postPaidTotal += additionalSplits * 4;
          else if (plan === "k") {
            const tier1 = Math.min(additionalSplits, 250);
            const tier2 = Math.max(0, additionalSplits - 250);
            postPaidTotal += tier1 * 4 + tier2 * 3.5;
          } else {
            const tier1 = Math.min(additionalSplits, 250);
            const tier2 = Math.min(Math.max(0, additionalSplits - 250), 250);
            const tier3 = Math.max(0, additionalSplits - 500);
            postPaidTotal += tier1 * 4 + tier2 * 3.5 + tier3 * 3;
          }
        }
      }

      // Kenlo Receita Extra
      let revenueFromBoletos = 0;
      if (addons.pay && (product === "loc" || product === "both")) {
        if (metrics.chargesBoletoToTenant) {
          revenueFromBoletos +=
            toNum(metrics.contractsUnderManagement) *
            toNum(metrics.boletoChargeAmount);
        }
        if (metrics.chargesSplitToOwner) {
          revenueFromBoletos +=
            toNum(metrics.contractsUnderManagement) *
            toNum(metrics.splitChargeAmount);
        }
      }

      const revenueFromInsurance =
        addons.seguros && (product === "loc" || product === "both")
          ? toNum(metrics.contractsUnderManagement) * 10
          : 0;
      const netGain =
        revenueFromBoletos +
        revenueFromInsurance -
        totalMonthly -
        (postPaidTotal || 0);

      // Calculate prepayment amounts
      const prepayment = calculatePrepaymentAmount();
      const prepaymentMonths =
        frequency === "annual" ? 12 : frequency === "biennial" ? 24 : 0;

      const compatibleAddons: string[] = [];
      const incompatibleAddons: string[] = [];

      // Define which add-ons are compatible with each product
      const imobCompatible = ["leads", "inteligencia", "assinatura"];
      const locCompatible = ["pay", "seguros", "inteligencia", "assinatura"];

      selectedAddons.forEach((addon: string) => {
        let isCompatible = false;

        if (product === "imob") {
          isCompatible = imobCompatible.includes(addon);
        } else if (product === "loc") {
          isCompatible = locCompatible.includes(addon);
        } else if (product === "both") {
          isCompatible = true;
        }

        if (isCompatible) {
          compatibleAddons.push(addon);
        } else {
          incompatibleAddons.push(addon);
        }
      });

      // Validate Premium Services logic
      // ALL Kombos include Premium Services (VIP + CS Dedicado) for free
      const hasPremiumIncluded =
        komboInfo?.name === "Kombo Imob Start" ||
        komboInfo?.name === "Kombo Core Gestão" ||
        komboInfo?.name === "Kombo Elite" ||
        komboInfo?.name === "Kombo Imob Pro" ||
        komboInfo?.name === "Kombo Locação Pro";

      const premiumServicesPrice = hasPremiumIncluded
        ? 0
        : ((metrics.imobVipSupport || metrics.locVipSupport)
            ? Pricing.getVipSupportPrice()
            : 0) +
          ((metrics.imobDedicatedCS || metrics.locDedicatedCS)
            ? Pricing.getCSDedicadoPrice()
            : 0);

      const proposalData = {
        salesPersonName: quoteInfo.vendorName,
        vendorEmail: quoteInfo.vendorEmail,
        vendorPhone: quoteInfo.vendorPhone,
        vendorRole: quoteInfo.vendorRole,
        clientName: businessNature.ownerName,
        agencyName: businessNature.companyName,
        productType: product,
        komboName: komboInfo?.name,
        komboDiscount: komboInfo
          ? Math.round(komboInfo.discount * 100)
          : undefined,
        imobPlan:
          product === "imob" || product === "both" ? imobPlan : undefined,
        locPlan:
          product === "loc" || product === "both" ? locPlan : undefined,
        imobUsers:
          typeof metrics.imobUsers === "number" ? metrics.imobUsers : 0,
        closings:
          typeof metrics.closingsPerMonth === "number"
            ? metrics.closingsPerMonth
            : 0,
        contracts:
          typeof metrics.contractsUnderManagement === "number"
            ? metrics.contractsUnderManagement
            : 0,
        newContracts:
          typeof metrics.newContractsPerMonth === "number"
            ? metrics.newContractsPerMonth
            : 0,
        leadsPerMonth:
          typeof metrics.leadsPerMonth === "number"
            ? metrics.leadsPerMonth
            : 0,
        usesExternalAI: metrics.usesExternalAI,
        wantsWhatsApp: metrics.wantsWhatsApp,
        chargesSplitToOwner: metrics.chargesSplitToOwner,
        chargesBoletoToTenant: metrics.chargesBoletoToTenant,
        boletoAmount: toNum(metrics.boletoChargeAmount),
        splitAmount: toNum(metrics.splitChargeAmount),
        businessType: businessNature.businessType,
        email: businessNature.email,
        cellphone: businessNature.cellphone,
        selectedAddons: JSON.stringify(compatibleAddons),
        paymentPlan: frequency,
        totalMonthly,
        totalAnnual,
        implantationFee,
        firstYearTotal,
        postPaidTotal,
        revenueFromBoletos,
        revenueFromInsurance,
        netGain,
        // Pre-payment fields
        prepayAdditionalUsers: prepayAdditionalUsers,
        prepayAdditionalContracts: prepayAdditionalContracts,
        prepaymentUsersAmount: prepayment.users,
        prepaymentContractsAmount: prepayment.contracts,
        prepaymentMonths: prepaymentMonths,
        // Monthly license base for PDF display
        monthlyLicenseBase: totalMonthly,
        // Premium services
        hasPremiumServices:
          hasPremiumIncluded ||
          ((metrics.imobVipSupport || metrics.locVipSupport) &&
            (metrics.imobDedicatedCS || metrics.locDedicatedCS)),
        premiumServicesPrice: premiumServicesPrice,
        // Installment options (from QuoteInfoDialog)
        installments: quoteInfo.installments,
        // Proposal validity (from QuoteInfoDialog)
        validityDays: quoteInfo.validityDays,
        // V8: Individual line item prices for Investimento table
        imobPrice: (() => {
          if (product !== "imob" && product !== "both") return undefined;
          const lineItems = getLineItems();
          const imobItem = lineItems.find((it) => it.name.startsWith("Imob"));
          return imobItem
            ? activeKombo !== "none"
              ? imobItem.priceComKombo
              : imobItem.priceSemKombo
            : undefined;
        })(),
        locPrice: (() => {
          if (product !== "loc" && product !== "both") return undefined;
          const lineItems = getLineItems();
          const locItem = lineItems.find((it) => it.name.startsWith("Loc"));
          return locItem
            ? activeKombo !== "none"
              ? locItem.priceComKombo
              : locItem.priceSemKombo
            : undefined;
        })(),
        addonPrices: (() => {
          const lineItems = getLineItems();
          const prices: Record<string, number> = {};
          const addonKeys = ["Leads", "Inteligência", "Assinatura"];
          const keyMap: Record<string, string> = {
            Leads: "leads",
            Inteligência: "inteligencia",
            Assinatura: "assinatura",
          };
          for (const item of lineItems) {
            if (addonKeys.includes(item.name)) {
              const price =
                activeKombo !== "none"
                  ? item.priceComKombo
                  : item.priceSemKombo;
              if (price > 0) prices[keyMap[item.name]] = price;
            }
          }
          return Object.keys(prices).length > 0
            ? JSON.stringify(prices)
            : undefined;
        })(),
        vipIncluded:
          hasPremiumIncluded &&
          (metrics.imobVipSupport || metrics.locVipSupport),
        csIncluded:
          hasPremiumIncluded &&
          (metrics.imobDedicatedCS || metrics.locDedicatedCS),
        vipPrice:
          !hasPremiumIncluded &&
          (metrics.imobVipSupport || metrics.locVipSupport)
            ? 97
            : 0,
        csPrice:
          !hasPremiumIncluded &&
          (metrics.imobDedicatedCS || metrics.locDedicatedCS)
            ? Pricing.getCSDedicadoPrice()
            : 0,
        // V8: Pós-pago breakdown
        postPaidBreakdown: (() => {
          const bd: any = { total: postPaidTotal };
          // IMOB: Additional Users (V9)
          if (
            (product === "imob" || product === "both") &&
            !prepayAdditionalUsers
          ) {
            const plan = imobPlan;
            const included = plan === "prime" ? 2 : plan === "k" ? 5 : 10;
            const additional = Math.max(0, toNum(metrics.imobUsers) - included);
            if (additional > 0) {
              const userCost = calculateAdditionalUsersCost(plan, additional);
              if (!bd.imobAddons)
                bd.imobAddons = {
                  groupLabel: "IMOB",
                  groupTotal: 0,
                  items: [],
                };
              bd.imobAddons.items.push({
                label: "Usuários Adicionais",
                included,
                additional,
                total: userCost,
                perUnit: plan === "prime" ? 57 : plan === "k" ? 47 : 37,
                unitLabel: "usuário",
              });
              bd.imobAddons.groupTotal += userCost;
            }
          }
          // LOC: Additional Contracts (V9: K=150)
          if (
            (product === "loc" || product === "both") &&
            !prepayAdditionalContracts
          ) {
            const plan = locPlan;
            const included =
              plan === "prime" ? 100 : plan === "k" ? 150 : 500;
            const additional = Math.max(
              0,
              toNum(metrics.contractsUnderManagement) - included
            );
            if (additional > 0) {
              let cost = 0;
              if (plan === "prime") {
                cost = additional * 3;
              } else if (plan === "k") {
                const t1 = Math.min(additional, 250);
                const t2 = Math.max(0, additional - 250);
                cost = t1 * 3 + t2 * 2.5;
              } else {
                const t1 = Math.min(additional, 250);
                const t2 = Math.min(Math.max(0, additional - 250), 250);
                const t3 = Math.max(0, additional - 500);
                cost = t1 * 3 + t2 * 2.5 + t3 * 2;
              }
              if (!bd.locAddons)
                bd.locAddons = {
                  groupLabel: "LOCAÇÃO",
                  groupTotal: 0,
                  items: [],
                };
              bd.locAddons.items.push({
                label: "Contratos Adicionais",
                included,
                additional,
                total: cost,
                perUnit: 3,
                unitLabel: "contrato",
              });
              bd.locAddons.groupTotal += cost;
            }
          }
          // LOC: Boleto costs (V9: tiered by plan)
          if (
            addons.pay &&
            metrics.chargesBoletoToTenant &&
            (product === "loc" || product === "both")
          ) {
            const plan = locPlan;
            const inclBoletos =
              plan === "prime" ? 2 : plan === "k" ? 5 : 15;
            const addBoletos = Math.max(
              0,
              toNum(metrics.contractsUnderManagement) - inclBoletos
            );
            if (addBoletos > 0) {
              let cost = 0;
              if (plan === "prime") {
                cost = addBoletos * 4;
              } else if (plan === "k") {
                const bt1 = Math.min(addBoletos, 250);
                const bt2 = Math.max(0, addBoletos - 250);
                cost = bt1 * 4 + bt2 * 3.5;
              } else {
                const bt1 = Math.min(addBoletos, 250);
                const bt2 = Math.min(Math.max(0, addBoletos - 250), 250);
                const bt3 = Math.max(0, addBoletos - 500);
                cost = bt1 * 4 + bt2 * 3.5 + bt3 * 3;
              }
              if (!bd.locAddons)
                bd.locAddons = {
                  groupLabel: "LOCAÇÃO",
                  groupTotal: 0,
                  items: [],
                };
              bd.locAddons.items.push({
                label: "Custo Boletos (Pay)",
                included: inclBoletos,
                additional: addBoletos,
                total: cost,
                perUnit: 4,
                unitLabel: "boleto",
              });
              bd.locAddons.groupTotal += cost;
            }
          }
          // LOC: Split costs (V9: tiered by plan)
          if (
            addons.pay &&
            metrics.chargesSplitToOwner &&
            (product === "loc" || product === "both")
          ) {
            const plan = locPlan;
            const inclSplits =
              plan === "prime" ? 2 : plan === "k" ? 5 : 15;
            const addSplits = Math.max(
              0,
              toNum(metrics.contractsUnderManagement) - inclSplits
            );
            if (addSplits > 0) {
              let cost = 0;
              if (plan === "prime") {
                cost = addSplits * 4;
              } else if (plan === "k") {
                const st1 = Math.min(addSplits, 250);
                const st2 = Math.max(0, addSplits - 250);
                cost = st1 * 4 + st2 * 3.5;
              } else {
                const st1 = Math.min(addSplits, 250);
                const st2 = Math.min(Math.max(0, addSplits - 250), 250);
                const st3 = Math.max(0, addSplits - 500);
                cost = st1 * 4 + st2 * 3.5 + st3 * 3;
              }
              if (!bd.locAddons)
                bd.locAddons = {
                  groupLabel: "LOCAÇÃO",
                  groupTotal: 0,
                  items: [],
                };
              bd.locAddons.items.push({
                label: "Custo Split (Pay)",
                included: inclSplits,
                additional: addSplits,
                total: cost,
                perUnit: 4,
                unitLabel: "split",
              });
              bd.locAddons.groupTotal += cost;
            }
          }
          // Shared: Digital Signatures (V9: tiered 1-20=R$1.80, 21-40=R$1.70, 41+=R$1.50)
          if (addons.assinatura) {
            const included = 15;
            let totalSigs = 0;
            if (product === "imob" || product === "both")
              totalSigs += toNum(metrics.closingsPerMonth);
            if (product === "loc" || product === "both")
              totalSigs += toNum(metrics.newContractsPerMonth);
            const additional = Math.max(0, totalSigs - included);
            if (additional > 0) {
              const st1 = Math.min(additional, 20);
              const st2 = Math.min(Math.max(0, additional - 20), 20);
              const st3 = Math.max(0, additional - 40);
              const cost = st1 * 1.8 + st2 * 1.7 + st3 * 1.5;
              if (!bd.sharedAddons)
                bd.sharedAddons = {
                  groupLabel: "Add-ons Compartilhados (IMOB + LOC)",
                  groupTotal: 0,
                  items: [],
                };
              bd.sharedAddons.items.push({
                label: "Assinaturas Digitais (compartilhado)",
                included,
                additional,
                total: cost,
                perUnit: 1.8,
                unitLabel: "assinatura",
              });
              bd.sharedAddons.groupTotal += cost;
            }
          }
          // Shared: WhatsApp Messages (V9: tiered)
          if (addons.leads && metrics.wantsWhatsApp) {
            const included = 100;
            const additional = Math.max(
              0,
              toNum(metrics.leadsPerMonth) - included
            );
            if (additional > 0) {
              const wt1 = Math.min(additional, 200);
              const wt2 = Math.min(Math.max(0, additional - 200), 150);
              const wt3 = Math.min(Math.max(0, additional - 350), 650);
              const wt4 = Math.max(0, additional - 1000);
              const cost = wt1 * 2 + wt2 * 1.8 + wt3 * 1.5 + wt4 * 1.2;
              if (!bd.sharedAddons)
                bd.sharedAddons = {
                  groupLabel: "Add-ons Compartilhados (IMOB + LOC)",
                  groupTotal: 0,
                  items: [],
                };
              bd.sharedAddons.items.push({
                label: "Mensagens WhatsApp",
                included,
                additional,
                total: cost,
                perUnit: 2,
                unitLabel: "msg",
              });
              bd.sharedAddons.groupTotal += cost;
            }
          }
          return JSON.stringify(bd);
        })(),
        // Kombo comparison data for Section 6 table
        komboComparison: (() => {
          const comparison: Array<{
            name: string;
            discount: number;
            totalMonthly: number;
            savings: number;
            isSelected: boolean;
            isAvailable: boolean;
          }> = [];
          // Calculate base total without any kombo
          const lineItems = getLineItems();
          const baseTotalNoKombo = lineItems.reduce(
            (sum, item) => sum + item.priceSemKombo,
            0
          );

          // "Sem Kombo" entry
          comparison.push({
            name: "Sem Kombo",
            discount: 0,
            totalMonthly: baseTotalNoKombo,
            savings: 0,
            isSelected: activeKombo === "none",
            isAvailable: true,
          });

          // Each Kombo
          Object.entries(KOMBOS).forEach(([key, kombo]) => {
            const isAvailable = kombo.requiredProducts.includes(product);
            const discountFactor = 1 - kombo.discount;
            const komboTotal = Math.round(baseTotalNoKombo * discountFactor);
            comparison.push({
              name: kombo.name,
              discount: Math.round(kombo.discount * 100),
              totalMonthly: komboTotal,
              savings: baseTotalNoKombo - komboTotal,
              isSelected: activeKombo === key,
              isAvailable,
            });
          });
          return JSON.stringify(comparison);
        })(),
        // Frequency comparison data for Section 5
        frequencyComparison: (() => {
          const lineItems = getLineItems();
          const baseTotalNoKombo = lineItems.reduce(
            (sum, item) => sum + item.priceSemKombo,
            0
          );
          const komboFactor = komboInfo ? 1 - komboInfo.discount : 1;
          const baseAnnual = Math.round(baseTotalNoKombo * komboFactor);
          const freqs = [
            {
              name: "Mensal",
              key: "monthly",
              multiplier: PAYMENT_FREQUENCY_MULTIPLIERS.monthly,
            },
            {
              name: "Semestral",
              key: "semestral",
              multiplier: PAYMENT_FREQUENCY_MULTIPLIERS.semestral,
            },
            {
              name: "Anual",
              key: "annual",
              multiplier: PAYMENT_FREQUENCY_MULTIPLIERS.annual,
            },
            {
              name: "Bienal",
              key: "biennial",
              multiplier: PAYMENT_FREQUENCY_MULTIPLIERS.biennial,
            },
          ];
          return JSON.stringify(
            freqs.map((f) => ({
              name: f.name,
              monthlyEquivalent: roundToEndIn7(
                Math.round(baseAnnual * f.multiplier)
              ),
              isSelected: frequency === f.key,
            }))
          );
        })(),
        // Selected columns data from comparison table (up to 3)
        selectedColumnsJson:
          selectedColumnsData.length > 0
            ? JSON.stringify(selectedColumnsData)
            : undefined,
      };

      await downloadProposalPDF(proposalData);

      toast.dismiss();
      toast.success("PDF baixado com sucesso!");

      {
        // Save to proposals database
        await createProposal.mutateAsync(proposalData);

        // Also save to quotes database for tracking
        try {
          await saveQuoteMutation.mutateAsync({
            action: "pdf_exported",
            product: product,
            imobPlan: product !== "loc" ? imobPlan : undefined,
            locPlan: product !== "imob" ? locPlan : undefined,
            frequency: frequency,
            addons: JSON.stringify(addons),
            metrics: JSON.stringify(metrics),
            totals: JSON.stringify({
              monthly: totalMonthly,
              annual: totalAnnual,
              implantation: implantationFee,
              postPaid: postPaidTotal,
              firstYear: firstYearTotal,
            }),
            komboId: activeKombo !== "none" ? activeKombo : undefined,
            komboName:
              activeKombo !== "none"
                ? KOMBOS[activeKombo]?.name
                : undefined,
            komboDiscount:
              activeKombo !== "none"
                ? Math.round((KOMBOS[activeKombo]?.discount || 0) * 100)
                : undefined,
            clientName: businessNature.ownerName,
            vendorName: quoteInfo.vendorName,
            salespersonId: quoteInfo.salespersonId,
            agencyName: businessNature.companyName,
            cellPhone: businessNature.cellphone,
            landlinePhone: businessNature.landline,
            websiteUrl: businessNature.hasWebsite
              ? businessNature.websiteUrl
              : "Cliente não tem site ainda",
            // Business nature
            businessType: businessNature.businessType,
            email: businessNature.email,
            hasCRM: businessNature.hasCRM ? 1 : 0,
            crmSystem: businessNature.hasCRM
              ? businessNature.crmSystem
              : undefined,
            crmOther:
              businessNature.hasCRM && businessNature.crmSystem === "Outro"
                ? businessNature.crmOther
                : undefined,
            hasERP: businessNature.hasERP ? 1 : 0,
            erpSystem: businessNature.hasERP
              ? businessNature.erpSystem
              : undefined,
            erpOther:
              businessNature.hasERP && businessNature.erpSystem === "Outro"
                ? businessNature.erpOther
                : undefined,
          });
        } catch (quoteError) {
          console.error("Failed to save quote:", quoteError);
        }

        toast.dismiss();
        toast.success("Proposta gerada e salva com sucesso!");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao gerar proposta. Tente novamente.");
      console.error("Error generating proposal:", error);
    }
  };

  return (
    <QuoteInfoDialog
      open={showQuoteInfoDialog}
      onOpenChange={setShowQuoteInfoDialog}
      paymentFrequency={frequency}
      onSubmit={handleSubmit}
    />
  );
}
