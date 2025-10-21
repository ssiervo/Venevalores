import axios from 'axios';
import dayjs from 'dayjs';
import type { ExchangeRate } from '../types.js';

const OPEN_ER_API = 'https://open.er-api.com/v6/latest/USD';

export async function fetchOfficialExchangeRate(): Promise<ExchangeRate> {
  const manualRate = process.env.BCV_EXCHANGE_RATE_MANUAL;
  if (manualRate) {
    const rate = Number.parseFloat(manualRate);
    if (!Number.isNaN(rate)) {
      return {
        source: 'Manual override',
        buyRate: rate,
        timestamp: new Date().toISOString(),
      };
    }
  }

  try {
    const response = await axios.get(OPEN_ER_API, { timeout: 7000 });
    const rate = response.data?.rates?.VES;
    if (!rate) {
      throw new Error('VES rate missing');
    }
    return {
      source: 'open.er-api.com (USD base)',
      buyRate: Number(rate),
      timestamp: dayjs
        .unix(Number(response.data?.time_last_update_unix) || Date.now() / 1000)
        .toISOString(),
    };
  } catch (error) {
    const fallback = Number(process.env.BCV_EXCHANGE_RATE_FALLBACK || 36.5);
    return {
      source: 'Fallback static',
      buyRate: fallback,
      timestamp: new Date().toISOString(),
    };
  }
}
