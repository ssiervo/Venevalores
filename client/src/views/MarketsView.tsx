import { useMemo, useState } from 'react';
import type { MarketOverviewResponse } from '../types';
import './MarketsView.css';

interface Props {
  data?: MarketOverviewResponse;
  loading: boolean;
  error?: string;
  onRefresh: () => void;
}

const cryptoMock = [
  { symbol: 'USDT', price: 1.0, change: 0.01 },
  { symbol: 'BTC', price: 65842, change: -0.85 },
  { symbol: 'ETH', price: 3481, change: 1.42 },
];

const commoditiesMock = [
  { symbol: 'Brent', price: 82.4, change: -0.32 },
  { symbol: 'Gold', price: 2375, change: 0.25 },
  { symbol: 'Coffee', price: 1.95, change: 0.41 },
];

const newsMock = [
  {
    title: 'BCV mantiene cronograma de inyecciones cambiarias',
    source: 'Banca y Negocios',
  },
  {
    title: 'Bonos corporativos lideran volumen en la jornada',
    source: 'Bolsa de Valores de Caracas',
  },
  {
    title: 'Petróleo estable con expectativa de recorte OPEP+',
    source: 'Reuters',
  },
];

export function MarketsView({ data, loading, error, onRefresh }: Props) {
  const [vesAmount, setVesAmount] = useState(1000);

  const exchangeRate = data?.exchangeRate;
  const usdResult = useMemo(() => {
    if (!exchangeRate) return 0;
    return vesAmount / exchangeRate.buyRate;
  }, [vesAmount, exchangeRate]);

  return (
    <section className="markets">
      <header>
        <div>
          <h1>Mercados y tasas</h1>
          <p>Consulta el tipo de cambio oficial, crypto de referencia y materias primas clave para el inversionista venezolano.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={onRefresh}>
          Actualizar
        </button>
      </header>

      {loading && <p className="markets__info">Actualizando datos de mercado…</p>}
      {error && <p className="markets__error">{error}</p>}

      <div className="markets__grid">
        <article className="markets__card">
          <h2>Tipo de cambio oficial</h2>
          {exchangeRate ? (
            <>
              <p className="markets__rate">{exchangeRate.buyRate.toFixed(2)} VES / USD</p>
              <small>Fuente: {exchangeRate.source}</small>
              <small>Última actualización: {new Date(exchangeRate.timestamp).toLocaleString('es-VE')}</small>
              <div className="markets__converter">
                <label>
                  Convertir VES a USD
                  <input
                    type="number"
                    value={vesAmount}
                    min={0}
                    onChange={(event) => setVesAmount(Number(event.target.value))}
                  />
                </label>
                <div className="markets__converter-result">
                  <span>≈ {usdResult.toFixed(2)} USD</span>
                  <small>
                    Calculado con la tasa del día. Ideal para estimar el equivalente de tus órdenes en dólares oficiales.
                  </small>
                </div>
              </div>
            </>
          ) : (
            <p className="muted">Conecta el servidor para obtener la tasa oficial del BCV.</p>
          )}
        </article>

        <article className="markets__card">
          <h2>Crypto de referencia</h2>
          <ul>
            {cryptoMock.map((item) => (
              <li key={item.symbol}>
                <span>{item.symbol}</span>
                <strong>{item.price.toLocaleString('en-US')}</strong>
                <span className={item.change >= 0 ? 'up' : 'down'}>
                  {item.change >= 0 ? '+' : ''}
                  {item.change}%
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="markets__card">
          <h2>Commodities clave</h2>
          <ul>
            {commoditiesMock.map((item) => (
              <li key={item.symbol}>
                <span>{item.symbol}</span>
                <strong>{item.price.toLocaleString('en-US')}</strong>
                <span className={item.change >= 0 ? 'up' : 'down'}>
                  {item.change >= 0 ? '+' : ''}
                  {item.change}%
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="markets__card markets__equities">
          <h2>Renta variable local</h2>
          <div className="markets__list-header">
            <span>Símbolo</span>
            <span>Precio</span>
            <span>Var %</span>
          </div>
          {(data?.equities ?? []).slice(0, 5).map((equity) => (
            <div key={equity.symbol} className="markets__list-row">
              <span>{equity.symbol}</span>
              <span>{equity.priceVES.toLocaleString('es-VE', { style: 'currency', currency: 'VES' })}</span>
              <span className={equity.variationPercent >= 0 ? 'up' : 'down'}>
                {equity.variationPercent >= 0 ? '+' : ''}
                {equity.variationPercent.toFixed(2)}%
              </span>
            </div>
          ))}
        </article>

        <article className="markets__card markets__bonds">
          <h2>Bonos destacados</h2>
          <div className="markets__list-header">
            <span>Serie</span>
            <span>% Precio</span>
            <span>Monto</span>
          </div>
          {(data?.bonds ?? []).slice(0, 5).map((bond) => (
            <div key={bond.symbol} className="markets__list-row">
              <span>{bond.symbol}</span>
              <span>{bond.pricePercent.toFixed(2)}%</span>
              <span>{bond.amountVES.toLocaleString('es-VE', { style: 'currency', currency: 'VES' })}</span>
            </div>
          ))}
        </article>

        <article className="markets__card markets__news">
          <h2>Noticias</h2>
          <ul>
            {newsMock.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <small>{item.source}</small>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
