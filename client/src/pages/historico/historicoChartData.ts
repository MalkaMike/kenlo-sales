/**
 * Pure functions to compute chart data from filtered quotes.
 */

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseJSON, productNames } from "./historicoConstants";
import type { Quote } from "@shared/types";

export interface VendorChartItem {
  name: string;
  count: number;
  value: number;
}

export interface ProductChartItem {
  name: string;
  count: number;
}

export interface TimeChartItem {
  date: string;
  count: number;
}

export interface HistoricoChartData {
  byVendor: VendorChartItem[];
  byProduct: ProductChartItem[];
  byTime: TimeChartItem[];
}

export function buildChartData(quotes: Quote[]): HistoricoChartData {
  if (!quotes || quotes.length === 0) {
    return { byVendor: [], byProduct: [], byTime: [] };
  }

  // Group by vendor
  const vendorMap = new Map<string, { count: number; value: number }>();
  quotes.forEach((quote) => {
    const vendor = quote.vendorName || "Sem vendedor";
    const totals = parseJSON(quote.totals);
    const value = totals?.annual || 0;

    if (!vendorMap.has(vendor)) {
      vendorMap.set(vendor, { count: 0, value: 0 });
    }
    const current = vendorMap.get(vendor)!;
    current.count++;
    current.value += value;
  });
  const byVendor = Array.from(vendorMap.entries())
    .map(([name, data]) => ({ name, count: data.count, value: data.value }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Group by product
  const productMap = new Map<string, number>();
  quotes.forEach((quote) => {
    const product = productNames[quote.product] || quote.product;
    productMap.set(product, (productMap.get(product) || 0) + 1);
  });
  const byProduct = Array.from(productMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Group by date (daily)
  const dateMap = new Map<string, number>();
  quotes.forEach((quote) => {
    const date = format(new Date(quote.createdAt), "dd/MM", { locale: ptBR });
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });
  const byTime = Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => {
      const [dayA, monthA] = a.date.split("/").map(Number);
      const [dayB, monthB] = b.date.split("/").map(Number);
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    })
    .slice(-30);

  return { byVendor, byProduct, byTime };
}
