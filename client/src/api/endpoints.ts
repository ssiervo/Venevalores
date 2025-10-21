import { apiClient } from './client';
import type {
  CreateOrderRequest,
  MarketOverviewResponse,
  PortfolioResponse,
} from '../types';

export async function fetchPortfolio() {
  const { data } = await apiClient.get<PortfolioResponse>('/api/portfolio');
  return data;
}

export async function fetchMarketOverview() {
  const { data } = await apiClient.get<MarketOverviewResponse>('/api/market/overview');
  return data;
}

export async function createPaperOrder(payload: CreateOrderRequest) {
  const { data } = await apiClient.post('/api/portfolio/orders', payload);
  return data;
}

export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'confirmed' | 'rejected',
  executionPriceVES?: number
) {
  const { data } = await apiClient.patch(`/api/portfolio/orders/${orderId}/status`, {
    status,
    executionPriceVES,
  });
  return data;
}
