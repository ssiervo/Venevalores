import { useCallback, useEffect, useState } from 'react';
import { fetchMarketOverview } from '../api/endpoints';
import type { MarketOverviewResponse } from '../types';

interface MarketState {
  data?: MarketOverviewResponse;
  loading: boolean;
  error?: string;
}

export function useMarketData() {
  const [state, setState] = useState<MarketState>({ loading: true });

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: undefined }));
    try {
      const data = await fetchMarketOverview();
      setState({ data, loading: false });
    } catch (error) {
      setState({ loading: false, error: 'No se pudo cargar el tablero de mercado.' });
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return {
    ...state,
    reload: loadData,
  };
}
