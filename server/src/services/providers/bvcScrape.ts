import { MarketProvider, Quote, assertSymbols } from './index.js';
import got from 'got';
import * as cheerio from 'cheerio';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: Number(process.env.CACHE_TTL_SECONDS || 180) });

export class BvcScrapeProvider implements MarketProvider {
  private readonly base = process.env.BVC_BASE_URL || 'https://www.bolsadecaracas.com';
  private readonly ua = process.env.REQUEST_USER_AGENT || 'VenevaloresBot/1.0';

  async getQuotes(symbols: string[]): Promise<Quote[]> {
    assertSymbols(symbols);
    const key = `bvc:${symbols.sort().join(',')}`;
    const cached = cache.get<Quote[]>(key);
    if (cached) {
      return cached;
    }

    const results: Quote[] = [];
    await Promise.all(
      symbols.map(async (sym) => {
        try {
          const url = `${this.base}/valor/${encodeURIComponent(sym)}`;
          const html = await got(url, { headers: { 'user-agent': this.ua } }).text();
          const $ = cheerio.load(html);

          const priceText =
            $('table, .quote, .cotizacion, .precio')
              .find('td, .value, .precio-valor')
              .filter((_, el) => /\d+[.,]\d+/.test($(el).text()))
              .first()
              .text()
              .replace(/\./g, '')
              .replace(',', '.')
              .trim();
          const price = priceText ? Number(priceText) : null;

          const changeText =
            $("td:contains('Variación'), .change, .variacion")
              .next()
              .first()
              .text()
              .replace('%', '')
              .replace(',', '.')
              .trim();
          const changePct = changeText ? Number(changeText) : null;

          const volumeText =
            $("td:contains('Volumen'), .volume, .volumen")
              .next()
              .first()
              .text()
              .replace(/\./g, '')
              .replace(',', '.')
              .trim();
          const volume = volumeText ? Number(volumeText) : null;

          results.push({ symbol: sym, price, changePct, volume, time: new Date().toISOString() });
        } catch {
          results.push({ symbol: sym, price: null, time: null });
        }
      })
    );

    cache.set(key, results);
    return results;
  }
}
