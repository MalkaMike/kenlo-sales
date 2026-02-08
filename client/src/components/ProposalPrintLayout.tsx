/**
 * ProposalPrintLayout - HTML layout for pixel-perfect PDF generation
 * 
 * This component renders a condensed 1-2 page executive summary proposal
 * using HTML/CSS that gets converted to PDF via html2pdf.js.
 * 
 * Design: Kenlo brand colors, clean corporate layout, CEO-to-CEO tone
 */

import React from "react";

// Types matching the proposalData structure from CalculadoraPage
export interface ProposalPrintData {
  // Vendor info
  salesPersonName: string;
  vendorEmail?: string;
  vendorPhone?: string;
  vendorRole?: string;
  // Client info
  clientName: string;
  agencyName?: string;
  email?: string;
  cellphone?: string;
  // Business
  businessType?: string;
  productType: string;
  // Plans
  imobPlan?: string;
  locPlan?: string;
  // Metrics
  imobUsers?: number;
  closings?: number;
  contracts?: number;
  newContracts?: number;
  leadsPerMonth?: number;
  usesExternalAI?: boolean;
  wantsWhatsApp?: boolean;
  // Pay
  chargesBoletoToTenant?: boolean;
  chargesSplitToOwner?: boolean;
  boletoAmount?: number;
  splitAmount?: number;
  // Kombo
  komboName?: string;
  komboDiscount?: number;
  // Add-ons
  selectedAddons: string; // JSON array
  // Pricing
  paymentPlan: string;
  totalMonthly: number;
  totalAnnual: number;
  implantationFee: number;
  firstYearTotal: number;
  postPaidTotal?: number;
  // Revenue
  revenueFromBoletos?: number;
  revenueFromInsurance?: number;
  netGain?: number;
  // Prepayment
  prepayAdditionalUsers?: boolean;
  prepayAdditionalContracts?: boolean;
  prepaymentUsersAmount?: number;
  prepaymentContractsAmount?: number;
  prepaymentMonths?: number;
  monthlyLicenseBase?: number;
  // Premium
  hasPremiumServices?: boolean;
  premiumServicesPrice?: number;
  // Installments
  installments?: number;
  // Individual prices
  imobPrice?: number;
  locPrice?: number;
  addonPrices?: string; // JSON: {leads: 557, inteligencia: 337, ...}
  vipIncluded?: boolean;
  csIncluded?: boolean;
  vipPrice?: number;
  csPrice?: number;
  // Pós-pago breakdown
  postPaidBreakdown?: string; // JSON
}

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(v);

const fmtNum = (v: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(v);

const FREQ_LABELS: Record<string, string> = {
  monthly: "Mensal (+25%)",
  semestral: "Semestral (+11%)",
  annual: "Anual (Referência)",
  biennial: "Bienal (-10%)",
};

const ADDON_LABELS: Record<string, string> = {
  leads: "Leads",
  inteligencia: "Inteligência",
  assinatura: "Assinatura",
  pay: "Pay",
  seguros: "Seguros",
  cash: "Cash",
};

const BIZ_LABELS: Record<string, string> = {
  broker: "Corretora",
  rental_admin: "Administradora de Locação",
  both: "Corretora + Administradora",
};

interface PostPaidItem {
  label: string;
  included: number;
  additional: number;
  total: number;
  perUnit: number;
  unitLabel: string;
}

interface PostPaidGroup {
  groupLabel: string;
  groupTotal: number;
  items: PostPaidItem[];
}

interface PostPaidBreakdown {
  imobAddons?: PostPaidGroup;
  locAddons?: PostPaidGroup;
  sharedAddons?: PostPaidGroup;
  total: number;
}

export const ProposalPrintLayout: React.FC<{ data: ProposalPrintData }> = ({ data }) => {
  const showImob = data.productType === "imob" || data.productType === "both";
  const showLoc = data.productType === "loc" || data.productType === "both";
  const issueDate = new Date().toLocaleDateString("pt-BR");
  
  let selAddons: string[] = [];
  try {
    const parsed = JSON.parse(data.selectedAddons);
    if (Array.isArray(parsed)) selAddons = parsed.map((a: string) => a.trim().toLowerCase());
  } catch {
    selAddons = data.selectedAddons.split(",").map((a) => a.trim().toLowerCase());
  }

  let addonPricesMap: Record<string, number> = {};
  try { if (data.addonPrices) addonPricesMap = JSON.parse(data.addonPrices); } catch {}

  let ppBreakdown: PostPaidBreakdown | null = null;
  try { if (data.postPaidBreakdown) ppBreakdown = JSON.parse(data.postPaidBreakdown); } catch {}

  const hasPostPaid = data.postPaidTotal && data.postPaidTotal > 0;
  const hasRevenue = (data.revenueFromBoletos && data.revenueFromBoletos > 0) ||
    (data.revenueFromInsurance && data.revenueFromInsurance > 0);
  
  const totalRevenue = (data.revenueFromBoletos || 0) + (data.revenueFromInsurance || 0);
  const monthlyRecurring = data.totalAnnual > 0 ? data.totalAnnual / 12 : (data.monthlyLicenseBase || data.totalMonthly || 0);
  const netGain = data.netGain || (totalRevenue - monthlyRecurring - (data.postPaidTotal || 0));
  const isPositive = netGain > 0;

  const installments = data.installments || 1;
  const totalInvestment = data.totalAnnual + data.implantationFee;
  const installmentValue = totalInvestment / installments;

  const hasVip = data.vipIncluded || (data.vipPrice !== undefined && data.vipPrice > 0);
  const hasCS = data.csIncluded || (data.csPrice !== undefined && data.csPrice > 0);

  // Kenlo white logo SVG inline
  const kenloLogoWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 120" width="88" height="24"><g fill="#FFFFFF"><path d="M0 0 L0 120 L30 120 L30 75 L35 70 L90 120 L130 120 L55 55 L125 0 L85 0 L30 50 L30 0 Z"/><path d="M155 35 C130 35 110 55 110 80 C110 105 130 120 155 120 C175 120 190 110 195 95 L170 95 C165 102 160 107 155 107 C142 107 133 97 133 85 L195 85 C195 83 195 81 195 80 C195 55 175 35 155 35 Z M155 48 C168 48 177 58 177 70 L133 70 C133 58 142 48 155 48 Z"/><path d="M210 40 L210 120 L235 120 L235 75 C235 62 245 52 260 52 C275 52 283 62 283 75 L283 120 L308 120 L308 70 C308 50 290 35 265 35 C250 35 238 42 235 52 L235 40 Z"/><path d="M325 0 L325 120 L350 120 L350 0 Z"/><path d="M395 35 C370 35 350 55 350 77.5 C350 100 370 120 395 120 C420 120 440 100 440 77.5 C440 55 420 35 395 35 Z M395 50 C410 50 420 62 420 77.5 C420 93 410 105 395 105 C380 105 370 93 370 77.5 C370 62 380 50 395 50 Z"/><circle cx="395" cy="15" r="10"/></g></svg>`;

  const kenloLogoRed = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 120" width="66" height="18"><g fill="#F82E52"><path d="M0 0 L0 120 L30 120 L30 75 L35 70 L90 120 L130 120 L55 55 L125 0 L85 0 L30 50 L30 0 Z"/><path d="M155 35 C130 35 110 55 110 80 C110 105 130 120 155 120 C175 120 190 110 195 95 L170 95 C165 102 160 107 155 107 C142 107 133 97 133 85 L195 85 C195 83 195 81 195 80 C195 55 175 35 155 35 Z M155 48 C168 48 177 58 177 70 L133 70 C133 58 142 48 155 48 Z"/><path d="M210 40 L210 120 L235 120 L235 75 C235 62 245 52 260 52 C275 52 283 62 283 75 L283 120 L308 120 L308 70 C308 50 290 35 265 35 C250 35 238 42 235 52 L235 40 Z"/><path d="M325 0 L325 120 L350 120 L350 0 Z"/><path d="M395 35 C370 35 350 55 350 77.5 C350 100 370 120 395 120 C420 120 440 100 440 77.5 C440 55 420 35 395 35 Z M395 50 C410 50 420 62 420 77.5 C420 93 410 105 395 105 C380 105 370 93 370 77.5 C370 62 380 50 395 50 Z"/><circle cx="395" cy="15" r="10"/></g></svg>`;

  return (
    <div
      id="proposal-print-root"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        fontSize: "9px",
        lineHeight: "1.35",
        color: "#1E293B",
        backgroundColor: "#FFFFFF",
        padding: 0,
        margin: 0,
        boxSizing: "border-box",
      }}
    >
      {/* ============ PAGE 1 ============ */}
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #F82E52 0%, #E11D48 100%)",
          padding: "16px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div dangerouslySetInnerHTML={{ __html: kenloLogoWhite }} />
          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.3)", paddingLeft: "12px" }}>
            <div style={{ color: "#FFFFFF", fontSize: "14px", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Orçamento Comercial
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "7.5px", marginTop: "1px" }}>
              Emissão: {issueDate} &nbsp;|&nbsp; Validade: 30 dias
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", color: "rgba(255,255,255,0.9)", fontSize: "7.5px", lineHeight: "1.5" }}>
          <div style={{ fontWeight: 600 }}>{data.salesPersonName}</div>
          <div>{data.vendorEmail || "vendas@kenlo.com.br"}</div>
          <div>{data.vendorPhone || ""}</div>
        </div>
      </div>

      {/* CLIENT BAR */}
      <div style={{ padding: "10px 28px 6px", borderBottom: "1px solid #F3F4F6" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <span style={{ color: "#F82E52", fontWeight: 700, fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Cliente
            </span>
            <span style={{ color: "#1E293B", fontWeight: 700, fontSize: "11px", marginLeft: "10px" }}>
              {data.agencyName || "Imobiliária"} &nbsp;|&nbsp; {data.clientName}
            </span>
          </div>
          <div style={{ color: "#6B7280", fontSize: "7.5px" }}>
            {[data.email, data.cellphone].filter(Boolean).join("  |  ")}
          </div>
        </div>
        {data.businessType && (
          <div style={{ color: "#6B7280", fontSize: "7.5px", marginTop: "2px" }}>
            {BIZ_LABELS[data.businessType] || data.businessType}
          </div>
        )}
      </div>

      <div style={{ padding: "8px 28px 0" }}>
        {/* SOLUTION + METRICS ROW */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
          {/* SOLUTION CARD */}
          {showImob && (
            <div style={{
              flex: 1,
              border: "1.5px solid #F82E52",
              borderRadius: "6px",
              padding: "8px 10px",
              background: "linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 100%)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#1E293B" }}>
                  Kenlo Imob
                </div>
                <div style={{
                  background: "#F82E52",
                  color: "#FFF",
                  fontSize: "7px",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "3px",
                  textTransform: "uppercase",
                }}>
                  {(data.imobPlan || "K").toUpperCase()}
                </div>
              </div>
              <div style={{ color: "#6B7280", fontSize: "7.5px" }}>CRM + Site para Vendas</div>
              <div style={{ display: "flex", gap: "12px", marginTop: "5px" }}>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1E293B" }}>{data.imobUsers || 0}</span>
                  <span style={{ fontSize: "7px", color: "#6B7280", marginLeft: "3px" }}>Usuários</span>
                </div>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1E293B" }}>{data.closings || 0}</span>
                  <span style={{ fontSize: "7px", color: "#6B7280", marginLeft: "3px" }}>Fecham./mês</span>
                </div>
                {data.leadsPerMonth && data.leadsPerMonth > 0 && (
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#1E293B" }}>{data.leadsPerMonth}</span>
                    <span style={{ fontSize: "7px", color: "#6B7280", marginLeft: "3px" }}>Leads/mês</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {showLoc && (
            <div style={{
              flex: 1,
              border: "1.5px solid #F82E52",
              borderRadius: "6px",
              padding: "8px 10px",
              background: "linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 100%)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#1E293B" }}>
                  Kenlo Locação
                </div>
                <div style={{
                  background: "#F82E52",
                  color: "#FFF",
                  fontSize: "7px",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "3px",
                  textTransform: "uppercase",
                }}>
                  {(data.locPlan || "K").toUpperCase()}
                </div>
              </div>
              <div style={{ color: "#6B7280", fontSize: "7.5px" }}>Gestão de Locações</div>
              <div style={{ display: "flex", gap: "12px", marginTop: "5px" }}>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1E293B" }}>{fmtNum(data.contracts || 0)}</span>
                  <span style={{ fontSize: "7px", color: "#6B7280", marginLeft: "3px" }}>Contratos</span>
                </div>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1E293B" }}>{data.newContracts || 0}</span>
                  <span style={{ fontSize: "7px", color: "#6B7280", marginLeft: "3px" }}>Novos/mês</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ADD-ONS + KOMBO ROW */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
          {/* Add-ons */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "8px", fontWeight: 700, color: "#1E293B", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Add-ons Selecionados
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {selAddons.length > 0 ? selAddons.map((addon) => (
                <span
                  key={addon}
                  style={{
                    background: "#FFF1F2",
                    border: "1px solid #FECDD3",
                    color: "#F82E52",
                    fontSize: "7.5px",
                    fontWeight: 600,
                    padding: "2px 7px",
                    borderRadius: "3px",
                  }}
                >
                  {ADDON_LABELS[addon] || addon}
                </span>
              )) : (
                <span style={{ color: "#9CA3AF", fontSize: "7.5px", fontStyle: "italic" }}>Nenhum add-on selecionado</span>
              )}
            </div>
          </div>

          {/* Kombo + Frequency */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "8px", fontWeight: 700, color: "#1E293B", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Kombo
                </div>
                {data.komboName ? (
                  <div style={{
                    background: "linear-gradient(135deg, #F82E52 0%, #E11D48 100%)",
                    color: "#FFF",
                    fontSize: "8px",
                    fontWeight: 700,
                    padding: "4px 8px",
                    borderRadius: "4px",
                    display: "inline-block",
                  }}>
                    {data.komboName}
                    {data.komboDiscount && data.komboDiscount > 0 && (
                      <span style={{ marginLeft: "6px", opacity: 0.85, fontSize: "7px" }}>
                        {data.komboDiscount}% OFF
                      </span>
                    )}
                  </div>
                ) : (
                  <span style={{ color: "#9CA3AF", fontSize: "7.5px" }}>Sem Kombo</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "8px", fontWeight: 700, color: "#1E293B", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Ciclo de Pagamento
                </div>
                <div style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  fontSize: "8px",
                  fontWeight: 600,
                  padding: "4px 8px",
                  borderRadius: "4px",
                  display: "inline-block",
                  color: "#1E293B",
                }}>
                  {FREQ_LABELS[data.paymentPlan] || data.paymentPlan}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============ INVESTIMENTO TABLE ============ */}
        <div style={{ fontSize: "8px", fontWeight: 700, color: "#1E293B", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Investimento
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6px", fontSize: "8px" }}>
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid #E5E7EB", fontWeight: 700, color: "#475569", fontSize: "7px", textTransform: "uppercase" }}>
                Item
              </th>
              <th style={{ textAlign: "right", padding: "4px 8px", borderBottom: "1px solid #E5E7EB", fontWeight: 700, color: "#475569", fontSize: "7px", textTransform: "uppercase" }}>
                Valor Mensal
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Products */}
            {showImob && data.imobPrice !== undefined && (
              <tr>
                <td style={{ padding: "3px 8px", borderBottom: "1px solid #F3F4F6" }}>
                  Imob — <span style={{ color: "#F82E52", fontWeight: 700 }}>{(data.imobPlan || "K").toUpperCase()}</span>
                </td>
                <td style={{ textAlign: "right", padding: "3px 8px", borderBottom: "1px solid #F3F4F6", fontWeight: 600 }}>
                  {fmt(data.imobPrice)}
                </td>
              </tr>
            )}
            {showLoc && data.locPrice !== undefined && (
              <tr>
                <td style={{ padding: "3px 8px", borderBottom: "1px solid #F3F4F6" }}>
                  Locação — <span style={{ color: "#F82E52", fontWeight: 700 }}>{(data.locPlan || "K").toUpperCase()}</span>
                </td>
                <td style={{ textAlign: "right", padding: "3px 8px", borderBottom: "1px solid #F3F4F6", fontWeight: 600 }}>
                  {fmt(data.locPrice)}
                </td>
              </tr>
            )}

            {/* Add-ons with prices */}
            {Object.entries(addonPricesMap)
              .filter(([_, price]) => price > 0)
              .map(([key, price]) => (
                <tr key={key}>
                  <td style={{ padding: "3px 8px", borderBottom: "1px solid #F3F4F6", color: "#475569" }}>
                    {ADDON_LABELS[key] || key}
                  </td>
                  <td style={{ textAlign: "right", padding: "3px 8px", borderBottom: "1px solid #F3F4F6", fontWeight: 600 }}>
                    {fmt(price)}
                  </td>
                </tr>
              ))}

            {/* Premium Services */}
            {hasVip && (
              <tr>
                <td style={{ padding: "3px 8px", borderBottom: "1px solid #F3F4F6", color: "#475569" }}>
                  Suporte VIP
                </td>
                <td style={{
                  textAlign: "right", padding: "3px 8px", borderBottom: "1px solid #F3F4F6",
                  fontWeight: 700, color: data.vipIncluded ? "#F82E52" : "#1E293B",
                }}>
                  {data.vipIncluded ? "Incluído" : fmt(data.vipPrice || 97)}
                </td>
              </tr>
            )}
            {hasCS && (
              <tr>
                <td style={{ padding: "3px 8px", borderBottom: "1px solid #F3F4F6", color: "#475569" }}>
                  CS Dedicado
                </td>
                <td style={{
                  textAlign: "right", padding: "3px 8px", borderBottom: "1px solid #F3F4F6",
                  fontWeight: 700, color: data.csIncluded ? "#F82E52" : "#1E293B",
                }}>
                  {data.csIncluded ? "Incluído" : fmt(data.csPrice || 197)}
                </td>
              </tr>
            )}

            {/* Total Monthly */}
            <tr style={{ background: "#F8FAFC" }}>
              <td style={{ padding: "4px 8px", borderBottom: "1.5px solid #E5E7EB", fontWeight: 700, fontSize: "8.5px" }}>
                Total Mensal
              </td>
              <td style={{ textAlign: "right", padding: "4px 8px", borderBottom: "1.5px solid #E5E7EB", fontWeight: 700, fontSize: "8.5px" }}>
                {fmt(data.totalMonthly)}
              </td>
            </tr>

            {/* Implantation */}
            <tr>
              <td style={{ padding: "3px 8px", borderBottom: "1px solid #F3F4F6", color: "#475569" }}>
                Implantação (única)
              </td>
              <td style={{ textAlign: "right", padding: "3px 8px", borderBottom: "1px solid #F3F4F6", fontWeight: 600 }}>
                {fmt(data.implantationFee)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* TOTAL INVESTIMENTO BOX */}
        <div style={{
          background: "#1E293B",
          borderRadius: "6px",
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
        }}>
          <div>
            <div style={{ color: "#FFFFFF", fontSize: "9px", fontWeight: 700 }}>
              Total Investimento
            </div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "7px", marginTop: "1px" }}>
              {installments > 1 ? `${installments}x de ${fmt(installmentValue)}` : "À vista"}
            </div>
          </div>
          <div style={{ color: "#FFFFFF", fontSize: "16px", fontWeight: 700 }}>
            {fmt(totalInvestment)}
          </div>
        </div>

        {/* Monthly recurring */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "4px 8px",
          background: "#F8FAFC",
          borderRadius: "4px",
          marginBottom: "8px",
          fontSize: "8px",
        }}>
          <span style={{ fontWeight: 600, color: "#475569" }}>
            Investimento Mensal Recorrente (Excl. implantação)
          </span>
          <span style={{ fontWeight: 700, color: "#1E293B" }}>
            {fmt(monthlyRecurring)}
          </span>
        </div>

        {/* ============ PÓS-PAGO SECTION ============ */}
        {hasPostPaid && ppBreakdown && (
          <>
            <div style={{ fontSize: "8px", fontWeight: 700, color: "#1E293B", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Custos Pós-Pago — Sem surpresas, só o que você usar
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6px", fontSize: "7.5px" }}>
              <tbody>
                {[ppBreakdown.imobAddons, ppBreakdown.locAddons, ppBreakdown.sharedAddons]
                  .filter((g): g is PostPaidGroup => !!g && g.items.length > 0)
                  .map((group, gi) => (
                    <React.Fragment key={gi}>
                      <tr style={{ borderTop: "1.5px solid #F82E52" }}>
                        <td colSpan={2} style={{ padding: "3px 8px", fontWeight: 700, color: "#F82E52", fontSize: "7.5px" }}>
                          {group.groupLabel}
                        </td>
                        <td style={{ textAlign: "right", padding: "3px 8px", fontWeight: 700, color: "#1E293B" }}>
                          {fmt(group.groupTotal)}
                        </td>
                      </tr>
                      {group.items.map((item, ii) => (
                        <tr key={ii}>
                          <td style={{ padding: "2px 8px 2px 16px", color: "#475569" }}>
                            {item.label}
                          </td>
                          <td style={{ padding: "2px 4px", color: "#9CA3AF", fontSize: "6.5px" }}>
                            Incl: {fmtNum(item.included)} / Adic: {fmtNum(item.additional)}
                          </td>
                          <td style={{ textAlign: "right", padding: "2px 8px", fontWeight: 600 }}>
                            {fmt(item.total)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                <tr style={{ borderTop: "1.5px solid #1E293B" }}>
                  <td colSpan={2} style={{ padding: "4px 8px", fontWeight: 700, fontSize: "8px" }}>
                    Total Pós-pago Estimado
                  </td>
                  <td style={{ textAlign: "right", padding: "4px 8px", fontWeight: 700, fontSize: "8px", color: "#F82E52" }}>
                    {fmt(ppBreakdown.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* ============ RECEITA EXTRA SECTION ============ */}
        {hasRevenue && (
          <>
            <div style={{ fontSize: "8px", fontWeight: 700, color: "#1E293B", marginBottom: "4px", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Kenlo Receita Extra
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
              {/* Pay Revenue */}
              {data.revenueFromBoletos && data.revenueFromBoletos > 0 && (
                <div style={{
                  flex: 1,
                  border: "1.5px solid #FECDD3",
                  borderRadius: "6px",
                  padding: "7px 10px",
                  background: "#FFF1F2",
                }}>
                  <div style={{ fontSize: "8.5px", fontWeight: 700, color: "#F82E52", marginBottom: "2px" }}>
                    Kenlo Pay
                  </div>
                  <div style={{ color: "#6B7280", fontSize: "6.5px", marginBottom: "4px" }}>
                    Receita de boletos e split digital
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#10B981", textAlign: "right" }}>
                    + {fmt(data.revenueFromBoletos)}
                  </div>
                </div>
              )}
              {/* Seguros Revenue */}
              {data.revenueFromInsurance && data.revenueFromInsurance > 0 && (
                <div style={{
                  flex: 1,
                  border: "1.5px solid #FECDD3",
                  borderRadius: "6px",
                  padding: "7px 10px",
                  background: "#FFF1F2",
                }}>
                  <div style={{ fontSize: "8.5px", fontWeight: 700, color: "#F82E52", marginBottom: "2px" }}>
                    Kenlo Seguros
                  </div>
                  <div style={{ color: "#6B7280", fontSize: "6.5px", marginBottom: "4px" }}>
                    R$10/contrato/mês
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#10B981", textAlign: "right" }}>
                    + {fmt(data.revenueFromInsurance)}
                  </div>
                </div>
              )}
            </div>

            {/* FINANCIAL SUMMARY */}
            <div style={{
              background: "#F8FAFC",
              border: "1px solid #E5E7EB",
              borderRadius: "6px",
              padding: "8px 12px",
              marginBottom: "6px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "8px" }}>
                <span>Receita Kenlo Pay</span>
                <span style={{ color: "#10B981", fontWeight: 700 }}>+ {fmt(data.revenueFromBoletos || 0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "8px" }}>
                <span>Receita Kenlo Seguros</span>
                <span style={{ color: "#10B981", fontWeight: 700 }}>+ {fmt(data.revenueFromInsurance || 0)}</span>
              </div>
              <div style={{ borderTop: "1px solid #E5E7EB", margin: "3px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "8px", fontWeight: 700 }}>
                <span>Total Receita Mensal</span>
                <span style={{ color: "#10B981" }}>{fmt(totalRevenue)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "8px" }}>
                <span>Investimento Mensal Kenlo</span>
                <span style={{ color: "#F82E52", fontWeight: 700 }}>- {fmt(monthlyRecurring)}</span>
              </div>
              {hasPostPaid && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "8px" }}>
                  <span>Estimativa Pós-pagos</span>
                  <span style={{ color: "#F82E52", fontWeight: 700 }}>- {fmt(data.postPaidTotal || 0)}</span>
                </div>
              )}
            </div>

            {/* NET GAIN BOX */}
            <div style={{
              background: isPositive
                ? "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)"
                : "linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)",
              border: `2px solid ${isPositive ? "#6EE7B7" : "#FCA5A5"}`,
              borderRadius: "8px",
              padding: "10px 14px",
              textAlign: "center",
              marginBottom: "6px",
            }}>
              <div style={{ fontSize: "8px", fontWeight: 700, color: "#1E293B", marginBottom: "2px" }}>
                Ganho Líquido Mensal Estimado
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: isPositive ? "#10B981" : "#EF4444" }}>
                {fmt(netGain)}
              </div>
              <div style={{ fontSize: "6.5px", color: "#6B7280", marginTop: "2px" }}>
                {isPositive
                  ? "Receitas extras superam o investimento na plataforma"
                  : "Investimento na plataforma supera receitas extras"}
              </div>
            </div>

            {/* ROI INDICATORS */}
            {isPositive && monthlyRecurring > 0 && (
              <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                <div style={{
                  flex: 1,
                  background: "#F8FAFC",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  padding: "8px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#10B981" }}>
                    {((totalRevenue / monthlyRecurring) * 100 - 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: "6.5px", color: "#6B7280" }}>ROI Receita vs Investimento</div>
                </div>
                <div style={{
                  flex: 1,
                  background: "#F8FAFC",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  padding: "8px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#3B82F6" }}>
                    {netGain > 0 ? Math.ceil((data.implantationFee || 0) / netGain) : "—"}
                  </div>
                  <div style={{ fontSize: "6.5px", color: "#6B7280" }}>Meses para Payback</div>
                </div>
                <div style={{
                  flex: 1,
                  background: "#F8FAFC",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  padding: "8px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#10B981" }}>
                    {fmt(netGain * 12)}
                  </div>
                  <div style={{ fontSize: "6.5px", color: "#6B7280" }}>Ganho Anual Estimado</div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============ MANDATORY COPY ============ */}
        <div style={{
          textAlign: "center",
          padding: "4px 0",
          fontSize: "7.5px",
          color: "#6B7280",
          fontStyle: "italic",
        }}>
          Kenlo é a única plataforma que pode se pagar enquanto você usa.
        </div>

        {/* ============ CTA FOOTER ============ */}
        <div style={{
          background: "linear-gradient(135deg, #F82E52 0%, #E11D48 100%)",
          borderRadius: "6px",
          padding: "10px 16px",
          textAlign: "center",
          marginTop: "4px",
        }}>
          <div style={{ color: "#FFFFFF", fontSize: "11px", fontWeight: 700 }}>
            Kenlo — Quem usa, lidera.
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "7px", marginTop: "2px" }}>
            Transforme sua imobiliária em uma máquina de resultados
          </div>
        </div>

        {/* LEGAL DISCLAIMER */}
        <div style={{
          textAlign: "center",
          padding: "4px 0 2px",
          fontSize: "6px",
          color: "#9CA3AF",
        }}>
          Não inclui impostos. &nbsp;|&nbsp; Valores em base mensal equivalente. &nbsp;|&nbsp; Proposta válida por 30 dias.
        </div>
      </div>
    </div>
  );
};
