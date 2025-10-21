import { useMemo, useState } from 'react';
import type { EquityQuote } from '../types';
import './SearchView.css';

interface Props {
  equities: EquityQuote[];
}

export function SearchView({ equities }: Props) {
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('todos');

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return equities
      .filter((equity) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          equity.name.toLowerCase().includes(normalizedQuery) ||
          equity.symbol.toLowerCase().includes(normalizedQuery);
        if (!matchesQuery) {
          return false;
        }
        if (industry === 'todos') {
          return true;
        }
        // Simulated industry assignment based on symbol prefix
        if (industry === 'banca') {
          return equity.symbol.startsWith('B');
        }
        if (industry === 'servicios') {
          return equity.symbol.startsWith('S');
        }
        if (industry === 'industrial') {
          return equity.symbol.startsWith('I');
        }
        return true;
      })
      .sort((a, b) => b.variationPercent - a.variationPercent);
  }, [equities, query, industry]);

  const gainers = useMemo(() => [...equities].sort((a, b) => b.variationPercent - a.variationPercent).slice(0, 5), [equities]);
  const losers = useMemo(() => [...equities].sort((a, b) => a.variationPercent - b.variationPercent).slice(0, 5), [equities]);

  return (
    <section className="search">
      <header>
        <h1>Descubre símbolos</h1>
        <p>Explora la renta variable venezolana por rendimiento, industria o actividad.</p>
      </header>
      <div className="search__controls">
        <input
          type="search"
          placeholder="Buscar por nombre, ticker o ISIN"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select value={industry} onChange={(event) => setIndustry(event.target.value)}>
          <option value="todos">Todos los sectores</option>
          <option value="banca">Banca y seguros</option>
          <option value="servicios">Servicios</option>
          <option value="industrial">Industrial y alimentos</option>
        </select>
      </div>

      <div className="search__highlights">
        <div>
          <h2>Ganadores del día</h2>
          <ul>
            {gainers.map((equity) => (
              <li key={equity.symbol}>
                <span>{equity.symbol}</span>
                <strong className="up">{equity.variationPercent.toFixed(2)}%</strong>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Perdedores del día</h2>
          <ul>
            {losers.map((equity) => (
              <li key={equity.symbol}>
                <span>{equity.symbol}</span>
                <strong className="down">{equity.variationPercent.toFixed(2)}%</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="search__results">
        <div className="search__results-header">
          <span>Símbolo</span>
          <span>Nombre</span>
          <span>Precio (VES)</span>
          <span>Variación</span>
          <span>Monto efectivo</span>
        </div>
        {filtered.map((equity) => (
          <div key={equity.symbol} className="search__row">
            <strong>{equity.symbol}</strong>
            <span>{equity.name}</span>
            <span>{equity.priceVES.toLocaleString('es-VE', { style: 'currency', currency: 'VES' })}</span>
            <span className={equity.variationPercent >= 0 ? 'up' : 'down'}>
              {equity.variationPercent >= 0 ? '+' : ''}
              {equity.variationPercent.toFixed(2)}%
            </span>
            <span>{equity.amountVES.toLocaleString('es-VE', { style: 'currency', currency: 'VES' })}</span>
          </div>
        ))}
        {filtered.length === 0 && <p className="muted">No encontramos símbolos con esos filtros.</p>}
      </div>
    </section>
  );
}
