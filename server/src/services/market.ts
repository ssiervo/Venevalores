import type { MarketProvider } from './providers/index.js';
import { BvcScrapeProvider } from './providers/bvcScrape.js';
import { SheetProvider } from './providers/sheet.js';
import { DummyProvider } from './providers/dummy.js';

export function getMarketProvider(): MarketProvider {
  const provider = (process.env.MARKET_DATA_PROVIDER || 'dummy').toLowerCase();
  switch (provider) {
    case 'bvc_scrape':
      return new BvcScrapeProvider();
    case 'sheet':
      return new SheetProvider();
    default:
      return new DummyProvider();
  }
}
