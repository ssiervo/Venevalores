import { useEffect, useState } from 'react';
import './ProfileView.css';

export interface ProfileSettings {
  defaultCurrency: 'VES' | 'USD';
  emailAlerts: boolean;
  defaultBrokerEmail: string;
}

const STORAGE_KEY = 'vene-valores-settings';

function loadSettings(): ProfileSettings {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      defaultCurrency: 'VES',
      emailAlerts: true,
      defaultBrokerEmail: '',
    };
  }
  try {
    return JSON.parse(raw) as ProfileSettings;
  } catch (error) {
    return {
      defaultCurrency: 'VES',
      emailAlerts: true,
      defaultBrokerEmail: '',
    };
  }
}

export function ProfileView({ onCurrencyChange }: { onCurrencyChange: (currency: 'VES' | 'USD') => void }) {
  const [settings, setSettings] = useState<ProfileSettings>(() =>
    typeof window === 'undefined'
      ? { defaultCurrency: 'VES', emailAlerts: true, defaultBrokerEmail: '' }
      : loadSettings()
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextSettings: ProfileSettings = {
      defaultCurrency: (formData.get('defaultCurrency') as 'VES' | 'USD') || 'VES',
      emailAlerts: Boolean(formData.get('emailAlerts')),
      defaultBrokerEmail: String(formData.get('defaultBrokerEmail') || ''),
    };
    setSettings(nextSettings);
    onCurrencyChange(nextSettings.defaultCurrency);
    setMessage('Preferencias actualizadas. Tus próximas órdenes usarán estas opciones por defecto.');
  };

  return (
    <section className="profile">
      <header>
        <h1>Perfil y preferencias</h1>
        <p>Configura tu experiencia simulada, exporta datos y personaliza alertas.</p>
      </header>

      {message && <p className="profile__message">{message}</p>}

      <form className="profile__form" onSubmit={handleSubmit}>
        <label>
          Moneda predeterminada
          <select name="defaultCurrency" defaultValue={settings.defaultCurrency}>
            <option value="VES">Bolívares (VES)</option>
            <option value="USD">Dólares (Oficial)</option>
          </select>
        </label>
        <label>
          Correo de tu corredor
          <input
            type="email"
            name="defaultBrokerEmail"
            placeholder="broker@casadebolsa.com"
            defaultValue={settings.defaultBrokerEmail}
          />
        </label>
        <label className="checkbox">
          <input type="checkbox" name="emailAlerts" defaultChecked={settings.emailAlerts} />
          Quiero recibir recordatorios cuando haya variaciones fuertes en mis posiciones.
        </label>
        <button type="submit" className="btn-primary">
          Guardar cambios
        </button>
      </form>

      <section className="profile__exports">
        <h2>Exportar datos</h2>
        <p>Descarga tus operaciones simuladas para compartirlas con tu asesor financiero o importarlas a Excel.</p>
        <button type="button" className="btn-secondary" onClick={() => setMessage('Exportación generada en formato CSV (demo).')}>
          Exportar CSV
        </button>
      </section>
    </section>
  );
}
