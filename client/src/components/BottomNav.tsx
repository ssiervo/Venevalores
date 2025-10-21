import './BottomNav.css';

const tabs = [
  { id: 'portfolio', label: 'Portafolio', icon: '📊' },
  { id: 'search', label: 'Buscar', icon: '🔎' },
  { id: 'insights', label: 'Insights', icon: '📈' },
  { id: 'markets', label: 'Mercados', icon: '🌐' },
  { id: 'predictions', label: 'Predicciones', icon: '🔮' },
  { id: 'profile', label: 'Perfil', icon: '👤' },
] as const;

export type TabId = (typeof tabs)[number]['id'];

interface Props {
  active: TabId;
  onSelect: (tab: TabId) => void;
}

export function BottomNav({ active, onSelect }: Props) {
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`bottom-nav__item ${active === tab.id ? 'bottom-nav__item--active' : ''}`}
          onClick={() => onSelect(tab.id)}
        >
          <span aria-hidden>{tab.icon}</span>
          <span className="bottom-nav__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
