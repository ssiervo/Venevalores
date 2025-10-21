import { Router } from 'express';
import { fetchBvcSnapshot, fetchBondQuotes, fetchEquityQuotes } from '../services/bvcService.js';
import { fetchOfficialExchangeRate } from '../services/exchangeRateService.js';

const router = Router();

router.get('/equities', async (_req, res) => {
  try {
    const equities = await fetchEquityQuotes();
    res.json({ equities });
  } catch (error) {
    console.error('Failed to fetch equities', error);
    res.status(502).json({ message: 'No se pudo obtener la información de renta variable.' });
  }
});

router.get('/bonds', async (_req, res) => {
  try {
    const bonds = await fetchBondQuotes();
    res.json({ bonds });
  } catch (error) {
    console.error('Failed to fetch bonds', error);
    res.status(502).json({ message: 'No se pudo obtener la información de renta fija.' });
  }
});

router.get('/overview', async (_req, res) => {
  try {
    const [snapshot, exchangeRate] = await Promise.all([
      fetchBvcSnapshot(),
      fetchOfficialExchangeRate(),
    ]);
    res.json({ ...snapshot, exchangeRate });
  } catch (error) {
    console.error('Failed to fetch market overview', error);
    res.status(502).json({ message: 'No se pudo completar la consulta de mercado.' });
  }
});

export default router;
