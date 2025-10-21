import { Router } from 'express';
import { getMarketProvider } from '../services/market.js';

const router = Router();

router.get('/', async (req, res) => {
  const symbols = String(req.query.symbols || '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  try {
    const providerKey = (process.env.MARKET_DATA_PROVIDER || 'dummy').toLowerCase();
    const provider = getMarketProvider();
    const quotes = await provider.getQuotes(symbols);
    res.json({ provider: providerKey, quotes });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'failed to fetch quotes';
    res.status(500).json({ error: message });
  }
});

export default router;
