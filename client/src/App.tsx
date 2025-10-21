import { useMemo, useState } from 'react';
import './App.css';
import { BottomNav, type TabId } from './components/BottomNav';
import { usePortfolioData } from './hooks/usePortfolioData';
import { useMarketData } from './hooks/useMarketData';
import { PortfolioView } from './views/PortfolioView';
import { SearchView } from './views/SearchView';
import { InsightsView } from './views/InsightsView';
import { MarketsView } from './views/MarketsView';
import { PredictionsView } from './views/PredictionsView';
import { ProfileView } from './views/ProfileView';

function getInitialCurrency(): 'VES' | 'USD' {
  if (typeof window === 'undefined') {
    return 'VES';
  }
  const raw = window.localStorage.getItem('vene-valores-settings');
  if (!raw) return 'VES';
  try {
    const parsed = JSON.parse(raw) as { defaultCurrency?: 'VES' | 'USD' };
    return parsed.defaultCurrency ?? 'VES';
  } catch (error) {
    return 'VES';
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('portfolio');
  const [currency, setCurrency] = useState<'VES' | 'USD'>(() => getInitialCurrency());

  const portfolio = usePortfolioData();
  const market = useMarketData();

  const equities = useMemo(() => market.data?.equities ?? [], [market.data]);

  const renderContent = () => {
    switch (activeTab) {
      case 'portfolio':
        return (
          <PortfolioView
            data={portfolio.data}
            loading={portfolio.loading}
            error={portfolio.error}
            currency={currency}
            onCurrencyChange={setCurrency}
            onSubmitOrder={portfolio.submitOrder}
            onRefresh={portfolio.reload}
          />
        );
      case 'search':
        return <SearchView equities={equities} />;
      case 'insights':
        return <InsightsView equities={equities} />;
      case 'markets':
        return (
          <MarketsView
            data={market.data}
            loading={market.loading}
            error={market.error}
            onRefresh={market.reload}
          />
        );
      case 'predictions':
        return <PredictionsView />;
      case 'profile':
        return <ProfileView onCurrencyChange={setCurrency} />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <main>{renderContent()}</main>
      <footer className="app__footer">
        <p>VeneValores es un laboratorio educativo. No ejecuta operaciones reales ni reemplaza asesoría profesional.</p>
      </footer>
      <BottomNav active={activeTab} onSelect={setActiveTab} />
    </div>
  );
}

export default App;
