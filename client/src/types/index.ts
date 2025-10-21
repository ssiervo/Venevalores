export interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePriceVES: number;
  lastPriceVES: number;
  lastUpdate: string;
}

export interface PendingOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  priceVES: number;
  requestedCurrency: 'VES' | 'USD';
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  brokerEmail: string;
}

export interface PortfolioResponse {
  portfolio: {
    holdings: Holding[];
    pendingOrders: PendingOrder[];
  };
  exchangeRate: ExchangeRate;
  summary: PortfolioSummary;
}

export interface PortfolioSummary {
  detail: Array<{
    id: string;
    symbol: string;
    name: string;
    quantity: number;
    averagePriceVES: number;
    lastPriceVES: number;
    lastUpdate: string;
    valueVES: number;
    valueUSD: number;
  }>;
  totals: {
    totalVES: number;
    totalUSD: number;
  };
}

export interface ExchangeRate {
  source: string;
  buyRate: number;
  sellRate?: number;
  timestamp: string;
}

export interface EquityQuote {
  symbol: string;
  name: string;
  priceVES: number;
  variationPercent: number;
  variationValue: number;
  volume: number;
  amountVES: number;
  lastUpdate: string;
  iconUrl?: string;
}

export interface BondQuote {
  symbol: string;
  name: string;
  pricePercent: number;
  nominalAmountVES: number;
  amountVES: number;
  lastUpdate: string;
  iconUrl?: string;
}

export interface MarketOverviewResponse {
  equities: EquityQuote[];
  bonds: BondQuote[];
  exchangeRate: ExchangeRate;
}

export interface CreateOrderRequest {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  priceVES: number;
  requestedCurrency: 'VES' | 'USD';
  brokerEmail?: string;
  investorName?: string;
  executionDate?: string;
  additionalNotes?: string;
  sendEmail?: boolean;
}
