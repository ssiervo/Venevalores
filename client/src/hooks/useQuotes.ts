import { useEffect, useMemo, useState } from 'react';

type QuotesResponse = {
  provider?: string;
  quotes: Array<{
    symbol: string;
    price: number | null;
    change?: number | null;
    changePct?: number | null;
    volume?: number | null;
    time?: string | null;
  }>;
};

export function useQuotes(symbols: string[]) {
  const [data, setData] = useState<QuotesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => symbols.map((s) => s.trim().toUpperCase()).filter(Boolean), [symbols]);

  useEffect(() => {
    if (!query.length) {
      return;
    }
    const controller = new AbortController();
    const url = `${import.meta.env.VITE_API_URL}/api/quotes?symbols=${query.join(',')}`;

    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((json) => setData(json))
      .catch((err: unknown) => {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [query.join(',')]);

  return { data, loading, error };
}
