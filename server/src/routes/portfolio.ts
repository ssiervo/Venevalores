import { Router } from 'express';
import { fetchOfficialExchangeRate } from '../services/exchangeRateService.js';
import {
  type CreatePendingOrderInput,
  createPendingOrder,
  getPortfolio,
  updateOrderStatus,
} from '../services/portfolioService.js';
import { summarizePortfolio } from '../utils/currency.js';
import { sendBrokerOrderEmail } from '../services/emailService.js';
import { type BrokerOrderEmailPayload } from '../types.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const [portfolio, exchangeRate] = await Promise.all([
      getPortfolio(),
      fetchOfficialExchangeRate(),
    ]);
    const summary = summarizePortfolio(portfolio.holdings, exchangeRate);
    res.json({ portfolio, exchangeRate, summary });
  } catch (error) {
    console.error('Failed to load portfolio', error);
    res.status(500).json({ message: 'No se pudo cargar el portafolio.' });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const body = req.body as CreatePendingOrderInput & {
      investorName?: string;
      executionDate?: string;
      additionalNotes?: string;
      sendEmail?: boolean;
    };

    if (!body.symbol || !body.side || !body.quantity || !body.priceVES) {
      return res.status(400).json({ message: 'Faltan campos obligatorios para registrar la orden.' });
    }

    const order = await createPendingOrder({
      symbol: body.symbol,
      side: body.side,
      quantity: Number(body.quantity),
      priceVES: Number(body.priceVES),
      requestedCurrency: body.requestedCurrency || 'VES',
      brokerEmail: body.brokerEmail,
    });

    let emailResult: unknown = null;
    if (body.sendEmail && body.brokerEmail && body.investorName && body.executionDate) {
      const payload: BrokerOrderEmailPayload = {
        symbol: body.symbol,
        side: body.side,
        quantity: Number(body.quantity),
        priceVES: Number(body.priceVES),
        requestedCurrency: body.requestedCurrency || 'VES',
        brokerEmail: body.brokerEmail,
        investorName: body.investorName,
        executionDate: body.executionDate,
        ...(body.additionalNotes ? { additionalNotes: body.additionalNotes } : {}),
      };
      emailResult = await sendBrokerOrderEmail(payload);
    }

    res.status(201).json({ order, emailResult });
  } catch (error) {
    console.error('Failed to create order', error);
    res.status(500).json({ message: 'No se pudo crear la orden.' });
  }
});

router.patch('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, executionPriceVES } = req.body as {
      status: 'pending' | 'confirmed' | 'rejected';
      executionPriceVES?: number;
    };

    if (!status) {
      return res.status(400).json({ message: 'Debe indicar el estatus de la orden.' });
    }

    const portfolio = await updateOrderStatus(orderId, status, executionPriceVES);
    res.json({ portfolio });
  } catch (error) {
    console.error('Failed to update order status', error);
    res.status(500).json({ message: 'No se pudo actualizar la orden.' });
  }
});

export default router;
