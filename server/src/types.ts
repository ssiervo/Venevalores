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

export interface PortfolioState {
  holdings: Holding[];
  pendingOrders: PendingOrder[];
}

export interface BrokerOrderEmailPayload {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  priceVES: number;
  executionDate: string;
  brokerEmail: string;
  investorName: string;
  portfolioId?: string;
  additionalNotes?: string;
  requestedCurrency?: 'VES' | 'USD';
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

export interface QuoteResponse {
  equities: EquityQuote[];
  bonds: BondQuote[];
}

export interface MarketOverview {
  equities: EquityQuote[];
  bonds: BondQuote[];
  exchangeRate: ExchangeRate;
}
