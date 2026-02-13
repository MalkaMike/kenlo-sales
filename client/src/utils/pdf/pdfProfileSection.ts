/**
 * Section 2: Perfil Operacional do Cliente
 */

import type { jsPDF } from "jspdf";
import {
  type ProposalPrintData, M, CW,
  rgb, C, sectionTitle, divider, newPage, fmtNum, fmt,
  getDerivedFlags,
} from "./pdfHelpers";

export function renderProfile(doc: jsPDF, data: ProposalPrintData): number {
  // Start a new page after the cover
  let Y = newPage(doc, data);
  Y = sectionTitle(doc, "Perfil Operacional do Cliente", Y);

  const { showImob, showLoc, businessTypeDisplay } = getDerivedFlags(data);
  const profColW = (CW - 20) / 3;

  const renderField = (label: string, value: string, x: number, y: number) => {
    doc.setFontSize(7);
    doc.setTextColor(...rgb(C.textMuted));
    doc.setFont("helvetica", "normal");
    doc.text(label, x, y);
    doc.setFontSize(9);
    doc.setTextColor(...rgb(C.dark));
    doc.setFont("helvetica", "bold");
    doc.text(value, x, y + 11);
  };

  // Row 1: Razão Social | Proprietário | Natureza do Negócio
  const natureDisplay = (showImob && showLoc) ? "Ambos" : businessTypeDisplay;
  renderField("Razão Social", data.agencyName || "—", M, Y);
  renderField("Proprietário", data.clientName || "—", M + profColW + 10, Y);
  renderField("Natureza do Negócio", natureDisplay, M + (profColW + 10) * 2, Y);
  Y += 28;

  // Row 2: Email | Celular
  renderField("Email", data.email || "—", M, Y);
  renderField("Celular", data.cellphone || "—", M + profColW + 10, Y);
  Y += 28;

  divider(doc, Y);
  Y += 14;

  // Business metrics grouped by type
  if (showImob) {
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.primary));
    doc.setFont("helvetica", "bold");
    doc.text("Corretagem", M, Y);
    Y += 14;

    renderField("Número de Usuários", data.imobUsers ? fmtNum(data.imobUsers) : "—", M, Y);
    renderField("Leads por Mês", data.leadsPerMonth ? fmtNum(data.leadsPerMonth) : "—", M + profColW + 10, Y);
    renderField("Fechamentos por Mês", data.closings ? fmtNum(data.closings) : "—", M + (profColW + 10) * 2, Y);
    Y += 28;
  }

  if (showLoc) {
    if (showImob) { divider(doc, Y); Y += 14; }
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.primary));
    doc.setFont("helvetica", "bold");
    doc.text("Administração de Aluguel", M, Y);
    Y += 14;

    renderField("Contratos sob Gestão", data.contracts ? fmtNum(data.contracts) : "—", M, Y);
    renderField("Novos Contratos/Mês", data.newContracts ? fmtNum(data.newContracts) : "—", M + profColW + 10, Y);
    Y += 28;

    const boletoInfo = data.chargesBoletoToTenant ? `Sim — ${fmt(data.boletoAmount || 0)}` : "Não";
    const splitInfo = data.chargesSplitToOwner ? `Sim — ${fmt(data.splitAmount || 0)}` : "Não";
    renderField("Inquilino Paga Boleto?", boletoInfo, M, Y);
    renderField("Proprietário Paga Split?", splitInfo, M + profColW + 10, Y);
    Y += 28;
  }

  Y += 6;
  return Y;
}
