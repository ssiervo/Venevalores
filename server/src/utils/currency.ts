import type { ExchangeRate, Holding } from '../types.js';

export function convertHoldingToUSD(holding: Holding, rate: ExchangeRate) {
  const valueVES = holding.quantity * holding.lastPriceVES;
  const valueUSD = rate.buyRate ? valueVES / rate.buyRate : 0;
  return {
    ...holding,
    valueVES,
    valueUSD,
  };
}

export function summarizePortfolio(
  holdings: Holding[],
  rate: ExchangeRate
) {
  const detail = holdings.map((holding) => convertHoldingToUSD(holding, rate));
  const totals = detail.reduce(
    (acc, item) => {
      acc.totalVES += item.valueVES;
      acc.totalUSD += item.valueUSD;
      return acc;
    },
    { totalVES: 0, totalUSD: 0 }
  );
  return { detail, totals };
}
