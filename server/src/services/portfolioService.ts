import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'node:crypto';
import type { PortfolioState, PendingOrder } from '../types.js';

const dataFilePath = path.join(__dirname, '..', '..', 'data', 'portfolio.json');

async function readPortfolio(): Promise<PortfolioState> {
  const raw = await fs.readFile(dataFilePath, 'utf-8');
  return JSON.parse(raw) as PortfolioState;
}

async function writePortfolio(state: PortfolioState): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(state, null, 2), 'utf-8');
}

export async function getPortfolio(): Promise<PortfolioState> {
  return readPortfolio();
}

export interface CreatePendingOrderInput {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  priceVES: number;
  requestedCurrency: 'VES' | 'USD';
  brokerEmail: string;
}

export async function createPendingOrder(
  input: CreatePendingOrderInput
): Promise<PendingOrder> {
  const portfolio: PortfolioState = await readPortfolio();
  const timestamp = new Date().toISOString();
  const order: PendingOrder = {
    id: crypto.randomUUID(),
    status: 'pending',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  };
  portfolio.pendingOrders.push(order);
  await writePortfolio(portfolio);
  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: PendingOrder['status'],
  executionPriceVES?: number
): Promise<PortfolioState> {
  const portfolio = await readPortfolio();
  const order = portfolio.pendingOrders.find((item: PendingOrder) => item.id === orderId);
  if (!order) {
    throw new Error('Order not found');
  }
  order.status = status;
  order.updatedAt = new Date().toISOString();

  if (status === 'confirmed') {
    applyConfirmedOrder(order, portfolio, executionPriceVES ?? order.priceVES);
  }

  await writePortfolio(portfolio);
  return portfolio;
}

function applyConfirmedOrder(
  order: PendingOrder,
  portfolio: PortfolioState,
  executionPriceVES: number
): void {
  const holding = portfolio.holdings.find((item) => item.symbol === order.symbol);
  const timestamp = new Date().toISOString();

  if (order.side === 'buy') {
    if (holding) {
      const totalCost = holding.averagePriceVES * holding.quantity + executionPriceVES * order.quantity;
      const newQuantity = holding.quantity + order.quantity;
      holding.quantity = newQuantity;
      holding.averagePriceVES = Number((totalCost / newQuantity).toFixed(4));
      holding.lastPriceVES = executionPriceVES;
      holding.lastUpdate = timestamp;
    } else {
      portfolio.holdings.push({
        id: order.symbol,
        symbol: order.symbol,
        name: order.symbol,
        quantity: order.quantity,
        averagePriceVES: executionPriceVES,
        lastPriceVES: executionPriceVES,
        lastUpdate: timestamp,
      });
    }
  } else {
    if (!holding) {
      return;
    }
    const newQuantity = Math.max(holding.quantity - order.quantity, 0);
    holding.quantity = newQuantity;
    holding.lastPriceVES = executionPriceVES;
    holding.lastUpdate = timestamp;
    if (newQuantity === 0) {
      holding.averagePriceVES = 0;
    }
  }
}
