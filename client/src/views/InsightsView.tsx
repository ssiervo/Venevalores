import { useMemo, useState } from 'react';
import { ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from 'recharts';
import dayjs from 'dayjs';
import type { EquityQuote } from '../types';
import './InsightsView.css';

interface Props {
  equities: EquityQuote[];
}

function buildHistory(equity: EquityQuote) {
  const basePrice = equity.priceVES;
  return Array.from({ length: 30 }).map((_, index) => {
    const date = dayjs().subtract(29 - index, 'day');
    const noise = (Math.sin(index / 4) + Math.random() * 0.5) * (equity.variationPercent / 100);
    const price = basePrice * (1 + noise / 5);
    return {
      date: date.format('DD MMM'),
      price: Number(price.toFixed(2)),
    };
  });
}

export function InsightsView({ equities }: Props) {
  const [selectedSymbol, setSelectedSymbol] = useState(() => equities[0]?.symbol ?? '');

  const activeEquity = equities.find((equity) => equity.symbol === selectedSymbol) ?? equities[0];
  const history = useMemo(() => (activeEquity ? buildHistory(activeEquity) : []), [activeEquity]);

  if (!activeEquity) {
    return (
      <section className="insights">
        <p className="muted">Agrega símbolos para visualizar análisis técnico.</p>
      </section>
    );
  }

  const signal = activeEquity.variationPercent > 2 ? 'Alcista' : activeEquity.variationPercent < -2 ? 'Bajista' : 'Neutral';

  return (
    <section className="insights">
      <header>
        <div>
          <h1>Laboratorio de insights</h1>
          <p>
            Usa indicadores básicos para estudiar tendencias antes de ejecutar una orden real. Información educativa basada en
            datos públicos.
          </p>
        </div>
        <select value={selectedSymbol} onChange={(event) => setSelectedSymbol(event.target.value)}>
          {equities.map((equity) => (
            <option key={equity.symbol} value={equity.symbol}>
              {equity.symbol} · {equity.name}
            </option>
          ))}
        </select>
      </header>

      <div className="insights__chart">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={history} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#003f88" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#003f88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              formatter={(value: number) => value.toLocaleString('es-VE', { style: 'currency', currency: 'VES' })}
            />
            <Area type="monotone" dataKey="price" stroke="#003f88" fillOpacity={1} fill="url(#colorPrice)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="insights__grid">
        <article>
          <h2>Indicadores rápidos</h2>
          <ul>
            <li>
              <span>RSI (14)</span>
              <strong>{Math.min(100, Math.max(0, 50 + activeEquity.variationPercent * 3)).toFixed(1)}</strong>
            </li>
            <li>
              <span>MACD</span>
              <strong>{(activeEquity.variationPercent / 10).toFixed(2)}</strong>
            </li>
            <li>
              <span>SMA 20</span>
              <strong>{(activeEquity.priceVES * 0.97).toLocaleString('es-VE', { style: 'currency', currency: 'VES' })}</strong>
            </li>
            <li>
              <span>Volatilidad (ATR)</span>
              <strong>{(Math.abs(activeEquity.variationPercent) / 2).toFixed(2)}%</strong>
            </li>
          </ul>
        </article>
        <article>
          <h2>Señal del día</h2>
          <div className={`insights__signal insights__signal--${signal.toLowerCase()}`}>
            <span>{signal}</span>
            <small>
              Basado en la variación diaria (+/-2%). Combina indicadores técnicos y volumen para validar tu hipótesis antes de
              hablar con tu corredor.
            </small>
          </div>
        </article>
        <article>
          <h2>Glosario express</h2>
          <p>
            RSI mide sobrecompra o sobreventa. SMA es el promedio móvil simple. MACD compara medias exponenciales para detectar
            cambios de tendencia. ATR resume la volatilidad promedio.
          </p>
        </article>
      </div>
    </section>
  );
}
