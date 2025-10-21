import axios from 'axios';
import dayjs from 'dayjs';
import type { BondQuote, EquityQuote } from '../types.js';

const BVC_ENDPOINT = 'https://www.bolsadecaracas.com/wp-admin/admin-ajax.php';

function parseNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  const normalized = value.replace(/\./g, '').replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function fetchEquityQuotes(): Promise<EquityQuote[]> {
  const response = await axios.post(
    BVC_ENDPOINT,
    new URLSearchParams({ action: 'resumenMercadoRentaVariable' }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        Origin: 'https://www.bolsadecaracas.com',
        Referer: 'https://www.bolsadecaracas.com/',
      },
    }
  );

  const now = dayjs().toISOString();

  return (response.data as any[]).map((item) => {
    const variationValue = parseNumber(item.VAR_ABS);
    const amount = parseNumber(item.MONTO_EFECTIVO);
    const price = parseNumber(item.PRECIO);
    const volume = parseNumber(item.VOLUMEN);
    return {
      symbol: item.COD_SIMB,
      name: item.DESC_SIMB,
      priceVES: price,
      variationValue,
      variationPercent: parseNumber(item.VAR_REL),
      volume,
      amountVES: amount,
      lastUpdate: item.HORA ? dayjs().format('YYYY-MM-DD') + 'T' + item.HORA : now,
      iconUrl: item.ICON,
    } as EquityQuote;
  });
}

export async function fetchBondQuotes(): Promise<BondQuote[]> {
  const response = await axios.post(
    BVC_ENDPOINT,
    new URLSearchParams({ action: 'resumenMercadoRentaFija' }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        Origin: 'https://www.bolsadecaracas.com',
        Referer: 'https://www.bolsadecaracas.com/',
      },
    }
  );
  const now = dayjs().toISOString();

  return (response.data as any[]).map((item) => {
    const pricePercent = parseNumber(item.PRECIO);
    return {
      symbol: item.COD_SIMB,
      name: item.DESC_SIMB,
      pricePercent,
      nominalAmountVES: parseNumber(item.VOLUMEN),
      amountVES: parseNumber(item.MONTO_EFECTIVO),
      lastUpdate: item.HORA ? dayjs().format('YYYY-MM-DD') + 'T' + item.HORA : now,
      iconUrl: item.ICON,
    } as BondQuote;
  });
}

export async function fetchBvcSnapshot() {
  const [equities, bonds] = await Promise.all([
    fetchEquityQuotes(),
    fetchBondQuotes(),
  ]);
  return { equities, bonds };
}
