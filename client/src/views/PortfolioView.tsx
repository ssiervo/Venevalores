import { useMemo, useState } from 'react';
import type { CreateOrderRequest, PortfolioResponse } from '../types';
import './PortfolioView.css';

interface Props {
  data?: PortfolioResponse;
  loading: boolean;
  error?: string;
  currency: 'VES' | 'USD';
  onCurrencyChange: (mode: 'VES' | 'USD') => void;
  onSubmitOrder: (payload: CreateOrderRequest) => Promise<void>;
  onRefresh: () => void;
}

const leverageOptions = [
  { label: 'Sin margen', value: 1 },
  { label: '1.5×', value: 1.5 },
  { label: '2×', value: 2 },
];

export function PortfolioView({
  data,
  loading,
  error,
  currency,
  onCurrencyChange,
  onSubmitOrder,
  onRefresh,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [leverage, setLeverage] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const holdings = data?.summary.detail ?? [];
  const totals = data?.summary.totals ?? { totalVES: 0, totalUSD: 0 };
  const exchangeRate = data?.exchangeRate;

  const simulatedTotals = useMemo(() => {
    const multiplier = leverage;
    return {
      totalVES: totals.totalVES * multiplier,
      totalUSD: totals.totalUSD * multiplier,
    };
  }, [totals, leverage]);

  const formattedValue = (value: number) =>
    value.toLocaleString('es-VE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: CreateOrderRequest = {
      symbol: String(formData.get('symbol') || ''),
      side: formData.get('side') === 'sell' ? 'sell' : 'buy',
      quantity: Number(formData.get('quantity') || 0),
      priceVES: Number(formData.get('priceVES') || 0),
      requestedCurrency: (formData.get('requestedCurrency') as 'VES' | 'USD') || 'VES',
      brokerEmail: String(formData.get('brokerEmail') || ''),
      investorName: String(formData.get('investorName') || ''),
      executionDate: String(formData.get('executionDate') || ''),
      additionalNotes: String(formData.get('notes') || ''),
      sendEmail: Boolean(formData.get('sendEmail')),
    };

    if (!payload.symbol || !payload.quantity || !payload.priceVES) {
      setMessage('Completa símbolo, cantidad y precio para crear la orden.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmitOrder(payload);
      setMessage('Orden registrada. En cuanto el corredor confirme podrás verla en tu portafolio.');
      setShowForm(false);
      event.currentTarget.reset();
    } catch (submitError) {
      setMessage('Ocurrió un error al registrar la orden.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="portfolio">
      <header className="portfolio__header">
        <div>
          <h1>Portafolio simulado</h1>
          <p className="portfolio__timestamp">
            {exchangeRate && (
              <>
                {`Tasa oficial: ${exchangeRate.buyRate.toFixed(2)} VES/USD · Fuente: ${exchangeRate.source}`}
                <br />
                <span>Actualizado: {new Date(exchangeRate.timestamp).toLocaleString('es-VE')}</span>
              </>
            )}
          </p>
        </div>
        <div className="portfolio__currency-toggle">
          <button
            type="button"
            className={currency === 'VES' ? 'active' : ''}
            onClick={() => onCurrencyChange('VES')}
          >
            VES
          </button>
          <button
            type="button"
            className={currency === 'USD' ? 'active' : ''}
            onClick={() => onCurrencyChange('USD')}
          >
            USD (Oficial)
          </button>
        </div>
      </header>

      <div className="portfolio__totals">
        <div>
          <span className="label">Valor total</span>
          <strong>{currency === 'VES' ? formattedValue(totals.totalVES) : formattedValue(totals.totalUSD)}</strong>
        </div>
        <div>
          <span className="label">Valor con margen</span>
          <strong>
            {currency === 'VES'
              ? formattedValue(simulatedTotals.totalVES)
              : formattedValue(simulatedTotals.totalUSD)}
          </strong>
          <div className="portfolio__margin-options">
            {leverageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={leverage === option.value ? 'active' : ''}
                onClick={() => setLeverage(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <small>Simulación educativa. El costo financiero no se descuenta automáticamente.</small>
        </div>
      </div>

      <div className="portfolio__actions">
        <button type="button" className="btn-primary" onClick={() => setShowForm(true)}>
          Añadir operación
        </button>
        <button type="button" className="btn-secondary" onClick={onRefresh}>
          Actualizar datos
        </button>
      </div>

      {message && <div className="portfolio__message">{message}</div>}
      {loading && <div className="portfolio__loading">Cargando portafolio…</div>}
      {error && <div className="portfolio__error">{error}</div>}

      <div className="portfolio__table">
        <div className="portfolio__table-header">
          <span>Activo</span>
          <span className="align-right">Cantidad</span>
          <span className="align-right">Precio VES</span>
          <span className="align-right">Valor {currency}</span>
        </div>
        {holdings.map((holding) => {
          const value = currency === 'VES' ? holding.valueVES : holding.valueUSD;
          return (
            <div key={holding.id} className="portfolio__row">
              <div>
                <strong>{holding.symbol}</strong>
                <small>{holding.name}</small>
              </div>
              <div className="align-right">{holding.quantity.toLocaleString('es-VE')}</div>
              <div className="align-right">
                {holding.lastPriceVES.toLocaleString('es-VE', {
                  style: 'currency',
                  currency: 'VES',
                  minimumFractionDigits: 2,
                })}
              </div>
              <div className="align-right">{formattedValue(value)}</div>
            </div>
          );
        })}
        {holdings.length === 0 && !loading && (
          <div className="portfolio__row portfolio__row--empty">
            Aún no has agregado operaciones. ¡Registra tu primera compra o venta simulada!
          </div>
        )}
      </div>

      <section className="portfolio__pending">
        <h2>Órdenes pendientes</h2>
        {data?.portfolio.pendingOrders.length === 0 ? (
          <p className="muted">No tienes órdenes en espera. Todas las confirmaciones se reflejarán aquí.</p>
        ) : (
          <ul>
            {data?.portfolio.pendingOrders.map((order) => (
              <li key={order.id}>
                <div>
                  <strong>
                    {order.side === 'buy' ? 'Compra' : 'Venta'} {order.symbol} · {order.quantity} títulos
                  </strong>
                  <small>Precio solicitado: {order.priceVES.toLocaleString('es-VE', {
                    style: 'currency',
                    currency: 'VES',
                  })}</small>
                </div>
                <span className={`status status--${order.status}`}>{order.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showForm && (
        <div className="portfolio__dialog">
          <form onSubmit={handleSubmit} className="portfolio__form">
            <header>
              <h3>Crear orden simulada</h3>
              <button type="button" onClick={() => setShowForm(false)} className="close-btn">
                ×
              </button>
            </header>
            <div className="form-grid">
              <label>
                Símbolo
                <input name="symbol" placeholder="Ej: BVC" required />
              </label>
              <label>
                Sentido
                <select name="side">
                  <option value="buy">Compra</option>
                  <option value="sell">Venta</option>
                </select>
              </label>
              <label>
                Cantidad
                <input name="quantity" type="number" min="1" step="1" required />
              </label>
              <label>
                Precio (VES)
                <input name="priceVES" type="number" min="0" step="0.01" required />
              </label>
              <label>
                Mostrar en
                <select name="requestedCurrency" defaultValue="VES">
                  <option value="VES">Bolívares</option>
                  <option value="USD">Dólares oficiales</option>
                </select>
              </label>
              <label>
                Correo del corredor
                <input name="brokerEmail" type="email" placeholder="corredor@casa.com" />
              </label>
              <label>
                Nombre del inversionista
                <input name="investorName" placeholder="Tu nombre" />
              </label>
              <label>
                Fecha deseada
                <input name="executionDate" type="date" />
              </label>
              <label className="form-full">
                Notas al corredor
                <textarea name="notes" rows={3} placeholder="Instrucciones adicionales" />
              </label>
              <label className="form-checkbox">
                <input name="sendEmail" type="checkbox" /> Enviar correo automático al corredor
              </label>
            </div>
            <footer>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Enviando…' : 'Guardar orden'}
              </button>
            </footer>
          </form>
        </div>
      )}
    </section>
  );
}
