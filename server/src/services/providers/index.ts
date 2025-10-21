export type Quote = {
  symbol: string;
  price: number | null;
  change?: number | null;
  changePct?: number | null;
  volume?: number | null;
  time?: string | null;
};

export interface MarketProvider {
  getQuotes(symbols: string[]): Promise<Quote[]>;
}

export function assertSymbols(symbols: string[]) {
  if (!symbols || symbols.length === 0) throw new Error('No symbols requested');
}
