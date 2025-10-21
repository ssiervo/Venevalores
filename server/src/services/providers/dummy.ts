import { MarketProvider, Quote, assertSymbols } from './index.js';
import portfolioData from '../../../data/portfolio.json' with { type: 'json' };

type PortfolioHolding = {
  symbol?: string;
  lastPriceVES?: number | string;
};

type PortfolioData = {
  holdings?: PortfolioHolding[];
};

export class DummyProvider implements MarketProvider {
  async getQuotes(symbols: string[]): Promise<Quote[]> {
    assertSymbols(symbols);
    const map = new Map<string, number>();
    const holdings = (portfolioData as PortfolioData).holdings ?? [];
    for (const row of holdings) {
      if (row.symbol) {
        map.set(row.symbol, Number(row.lastPriceVES ?? 0));
      }
    }
    return symbols.map((s) => ({
      symbol: s,
      price: map.get(s) ?? null,
      time: new Date().toISOString(),
    }));
  }
}
