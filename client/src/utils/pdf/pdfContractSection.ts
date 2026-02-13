/**
 * Sections 3-6: Three-box layout
 *   Left = Estrutura Contratada
 *   Right Top = Investimento Contratual + Escopo Incluído
 *   Right Bottom = Serviços Premium Ativados
 */

import type { jsPDF } from "jspdf";
import {
  type ProposalPrintData, M, CW,
  rgb, C, sectionTitle, fmt, newPage,
  addonNameMap, allAddonKeys,
  getDerivedFlags,
} from "./pdfHelpers";

export function renderContractLayout(doc: jsPDF, data: ProposalPrintData): number {
  let Y = newPage(doc, data);

  const { showImob, showLoc, selAddons, cycleDisplay } = getDerivedFlags(data);
  const notSelectedAddons = allAddonKeys.filter(k => !selAddons.includes(k));

  // Calculate REAL charged value based on cycle
  let chargedValue = 0;
  const monthlyBase = data.totalAnnual / 12;
  if (data.paymentPlan === "monthly") chargedValue = monthlyBase;
  else if (data.paymentPlan === "semestral") chargedValue = monthlyBase * 6;
  else if (data.paymentPlan === "annual") chargedValue = monthlyBase * 12;
  else if (data.paymentPlan === "biennial") chargedValue = monthlyBase * 24;

  // Layout constants
  const leftW = CW * 0.48;
  const rightW = CW * 0.48;
  const gap = CW * 0.04;
  const leftX = M;
  const rightX = M + leftW + gap;

  // ── LEFT BOX: Estrutura Contratada ──
  const leftBoxY = Y;

  doc.setFillColor(...rgb(C.primary));
  doc.rect(leftX, leftBoxY, 3, 10, "F");
  doc.setFontSize(10);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text("Estrutura Contratada", leftX + 10, leftBoxY + 8);
  let lY = leftBoxY + 24;

  // Ciclo de Pagamento
  doc.setFontSize(7);
  doc.setTextColor(...rgb(C.textMuted));
  doc.setFont("helvetica", "normal");
  doc.text("Ciclo de Pagamento", leftX, lY);
  doc.setFontSize(11);
  doc.setTextColor(...rgb(C.primary));
  doc.setFont("helvetica", "bold");
  doc.text(cycleDisplay, leftX, lY + 13);
  lY += 28;

  // Produtos e Planos
  doc.setFontSize(7);
  doc.setTextColor(...rgb(C.textMuted));
  doc.setFont("helvetica", "normal");
  doc.text("Produtos e Planos", leftX, lY);
  let productsLine = "";
  if (showImob && showLoc) {
    productsLine = `Imob ${(data.imobPlan || "K").toUpperCase()} & Locação ${(data.locPlan || "K").toUpperCase()}`;
  } else if (showImob) {
    productsLine = `Imob ${(data.imobPlan || "K").toUpperCase()}`;
  } else if (showLoc) {
    productsLine = `Locação ${(data.locPlan || "K").toUpperCase()}`;
  }
  doc.setFontSize(10);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text(productsLine, leftX, lY + 13);
  lY += 28;

  // Kombo (if any)
  if (data.komboName && data.komboName !== "Sem Kombo") {
    doc.setFontSize(7);
    doc.setTextColor(...rgb(C.textMuted));
    doc.setFont("helvetica", "normal");
    doc.text("Kombo Ativo", leftX, lY);
    doc.setFontSize(10);
    doc.setTextColor(...rgb(C.primary));
    doc.setFont("helvetica", "bold");
    const komboText = data.komboDiscount
      ? `${data.komboName} (${data.komboDiscount}% OFF)`
      : data.komboName;
    doc.text(komboText, leftX, lY + 13);
    lY += 28;
  }

  // Add-ons Selecionados
  doc.setFontSize(8);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text("Add-ons Selecionados", leftX, lY);
  lY += 14;

  if (selAddons.length > 0) {
    selAddons.forEach((addon) => {
      doc.setFillColor(...rgb(C.green));
      doc.rect(leftX, lY - 7, 2, 12, "F");
      doc.setFontSize(8);
      doc.setTextColor(...rgb(C.dark));
      doc.setFont("helvetica", "normal");
      doc.text(addonNameMap[addon] || addon, leftX + 8, lY);
      lY += 16;
    });
  } else {
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.textMuted));
    doc.setFont("helvetica", "normal");
    doc.text("Nenhum selecionado", leftX + 8, lY);
    lY += 16;
  }

  // Add-ons Não Incluídos
  if (notSelectedAddons.length > 0) {
    lY += 6;
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.textMuted));
    doc.setFont("helvetica", "bold");
    doc.text("Add-ons Não Incluídos", leftX, lY);
    lY += 14;

    notSelectedAddons.forEach((addon) => {
      doc.setFillColor(...rgb(C.border));
      doc.rect(leftX, lY - 7, 2, 12, "F");
      doc.setFontSize(8);
      doc.setTextColor(...rgb(C.textLight));
      doc.setFont("helvetica", "normal");
      doc.text(addonNameMap[addon] || addon, leftX + 8, lY);
      lY += 16;
    });
  }

  // ── RIGHT TOP BOX: Investimento Contratual + Escopo ──
  let rY = leftBoxY;

  doc.setFillColor(...rgb(C.primary));
  doc.rect(rightX, rY, 3, 10, "F");
  doc.setFontSize(10);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text("Investimento Contratual", rightX + 10, rY + 8);
  rY += 24;

  doc.setFontSize(7);
  doc.setTextColor(...rgb(C.textMuted));
  doc.setFont("helvetica", "normal");
  doc.text(`Contrato ${cycleDisplay}`, rightX, rY);
  rY += 6;

  doc.setFontSize(7);
  doc.setTextColor(...rgb(C.textMuted));
  doc.setFont("helvetica", "normal");
  doc.text("Investimento Total:", rightX, rY);
  rY += 4;

  // Big price
  doc.setFontSize(18);
  doc.setTextColor(...rgb(C.primary));
  doc.setFont("helvetica", "bold");
  doc.text(fmt(chargedValue), rightX, rY + 14);
  rY += 22;

  // Installments
  if (data.installments && data.installments > 1) {
    const totalWithImpl = chargedValue + (data.implantationFee || 0);
    const installmentValue = totalWithImpl / data.installments;
    doc.setFontSize(7);
    doc.setTextColor(...rgb(C.textMuted));
    doc.setFont("helvetica", "normal");
    doc.text(`Parcelado em ${data.installments}x de ${fmt(installmentValue)}`, rightX, rY);
    rY += 12;
  }

  rY += 6;

  // Escopo Incluído na Contratação
  doc.setFillColor(...rgb(C.primary));
  doc.rect(rightX, rY, 3, 10, "F");
  doc.setFontSize(9);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text("Escopo Incluído na Contratação", rightX + 10, rY + 8);
  rY += 20;

  const scopeItems: string[] = [];
  if (showImob) {
    const imobUsers = data.imobPlan?.toLowerCase() === "prime" ? 2 : data.imobPlan?.toLowerCase() === "k" ? 5 : 10;
    scopeItems.push(`${imobUsers} usuários inclusos`);
  }
  if (showLoc) {
    const locContracts = data.locPlan?.toLowerCase() === "prime" ? 100 : data.locPlan?.toLowerCase() === "k" ? 150 : 500;
    scopeItems.push(`${locContracts} contratos inclusos`);
  }
  if (selAddons.includes("leads")) scopeItems.push("WhatsApp integrado");
  if (data.implantationFee > 0) scopeItems.push(`Implantação: ${fmt(data.implantationFee)}`);

  scopeItems.forEach((item) => {
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.text));
    doc.setFont("helvetica", "normal");
    doc.text("•", rightX + 4, rY);
    doc.text(item, rightX + 12, rY);
    rY += 13;
  });

  rY += 10;

  // ── RIGHT BOTTOM BOX: Serviços Premium Ativados ──
  doc.setFillColor(...rgb(C.primary));
  doc.rect(rightX, rY, 3, 10, "F");
  doc.setFontSize(9);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text("Serviços Premium Ativados", rightX + 10, rY + 8);
  rY += 22;

  const premiumServices = [
    { name: "Suporte VIP", included: data.vipIncluded || false, price: data.vipPrice || 0, detail: "" },
    { name: "CS Dedicado", included: data.csIncluded || false, price: data.csPrice || 0, detail: "" },
    { name: "Treinamentos", included: (data.imobPlan?.toLowerCase() === "k2" || data.locPlan?.toLowerCase() === "k2"), price: 0, detail: "2x online ou 1x presencial" },
  ];

  premiumServices.forEach((service) => {
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.dark));
    doc.setFont("helvetica", "bold");
    doc.text(service.name, rightX, rY);

    if (service.included) {
      doc.setFontSize(7);
      doc.setTextColor(...rgb(C.green));
      doc.setFont("helvetica", "bold");
      const statusText = service.detail ? `Incluído (${service.detail})` : "Incluído";
      doc.text(statusText, rightX + rightW - 4, rY, { align: "right" });
    } else if (service.price > 0) {
      doc.setFontSize(7);
      doc.setTextColor(...rgb(C.text));
      doc.setFont("helvetica", "normal");
      doc.text(fmt(service.price) + "/mês", rightX + rightW - 4, rY, { align: "right" });
    } else {
      doc.setFontSize(8);
      doc.setTextColor(...rgb(C.textLight));
      doc.setFont("helvetica", "normal");
      doc.text("—", rightX + rightW - 4, rY, { align: "right" });
    }
    rY += 18;
  });

  // Return Y as max of left and right columns
  return Math.max(lY, rY) + 16;
}
