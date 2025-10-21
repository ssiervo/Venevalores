import { MarketProvider, Quote, assertSymbols } from './index.js';
import got from 'got';

export class SheetProvider implements MarketProvider {
  private readonly csvUrl = process.env.SHEET_CSV_URL || '';

  async getQuotes(symbols: string[]): Promise<Quote[]> {
    assertSymbols(symbols);
    if (!this.csvUrl) {
      throw new Error('SHEET_CSV_URL not set');
    }

    const csv = await got(this.csvUrl).text();
    const lines = csv.trim().split(/\r?\n/);
    const header = lines.shift()?.split(',') ?? [];
    const idx = (name: string) => header.findIndex((h) => h.trim().toLowerCase() === name);

    const map = new Map<string, Quote>();
    for (const line of lines) {
      const cols = line.split(',');
      const q: Quote = {
        symbol: cols[idx('symbol')]?.trim() ?? '',
        price: Number(cols[idx('price')] || '0') || null,
        changePct: Number(cols[idx('changepct')] || '0') || null,
        volume: Number(cols[idx('volume')] || '0') || null,
        change: Number(cols[idx('change')] || '0') || null,
        time: cols[idx('time')]?.trim() || null,
      };
      if (q.symbol) {
        map.set(q.symbol, q);
      }
    }

    return symbols.map((s) => map.get(s) || { symbol: s, price: null, time: null });
  }
}
