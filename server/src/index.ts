import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import marketDataRouter from './routes/marketData.js';
import portfolioRouter from './routes/portfolio.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/market', marketDataRouter);
app.use('/api/portfolio', portfolioRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error', err);
  res.status(500).json({ message: 'Error inesperado en el servidor.' });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`VeneValores API listening on port ${PORT}`);
});
