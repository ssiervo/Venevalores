import { useCallback, useEffect, useState } from 'react';
import { createPaperOrder, fetchPortfolio, updateOrderStatus } from '../api/endpoints';
import type { CreateOrderRequest, PortfolioResponse } from '../types';

interface PortfolioState {
  data?: PortfolioResponse;
  loading: boolean;
  error?: string;
}

export function usePortfolioData() {
  const [state, setState] = useState<PortfolioState>({ loading: true });

  const loadPortfolio = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: undefined }));
    try {
      const data = await fetchPortfolio();
      setState({ data, loading: false });
    } catch (error) {
      setState({ loading: false, error: 'No se pudo cargar el portafolio.' });
    }
  }, []);

  useEffect(() => {
    void loadPortfolio();
  }, [loadPortfolio]);

  const submitOrder = useCallback(
    async (payload: CreateOrderRequest) => {
      const response = await createPaperOrder(payload);
      await loadPortfolio();
      return response;
    },
    [loadPortfolio]
  );

  const setOrderStatus = useCallback(
    async (orderId: string, status: 'pending' | 'confirmed' | 'rejected', executionPriceVES?: number) => {
      await updateOrderStatus(orderId, status, executionPriceVES);
      await loadPortfolio();
    },
    [loadPortfolio]
  );

  return {
    ...state,
    reload: loadPortfolio,
    submitOrder,
    setOrderStatus,
  };
}
