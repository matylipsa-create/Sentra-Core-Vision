import { useEffect, useState } from 'react';
import {
  isInterfaceAudioEnabled,
  playInterfaceCue,
  setInterfaceAudioEnabled,
} from '../lib/engineSound';
import { getApiToken, setApiToken } from '../services/ApiSession';

type SentraTheme = 'tactical' | 'cyberpunk' | 'field';

const THEME_KEY = 'sentra-pwa-theme';
const THEMES: { id: SentraTheme; label: string }[] = [
  { id: 'tactical', label: 'Verde táctico' },
  { id: 'cyberpunk', label: 'Azul ciberpunk' },
  { id: 'field', label: 'Alto contraste' },
];

function getStoredTheme(): SentraTheme {
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    return THEMES.some((theme) => theme.id === value) ? value as SentraTheme : 'tactical';
  } catch {
    return 'tactical';
  }
}

export function InterfaceSettings() {
  const [theme, setTheme] = useState<SentraTheme>(getStoredTheme);
  const [audioEnabled, setAudioEnabled] = useState(isInterfaceAudioEnabled);
  const [showApiAccess, setShowApiAccess] = useState(false);
  const [apiToken, setApiTokenValue] = useState('');
  const [hasApiToken, setHasApiToken] = useState(() => Boolean(getApiToken()));
  const [apiStatus, setApiStatus] = useState('');

  useEffect(() => {
    document.documentElement.dataset.sentraTheme = theme;
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      return;
    }
  }, [theme]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!isInterfaceAudioEnabled() || event.defaultPrevented) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLElement>('button, [role="button"]');
      if (!button || button.dataset.interfaceSound === 'skip') return;
      playInterfaceCue('click');
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  const handleAudioChange = (enabled: boolean) => {
    setAudioEnabled(enabled);
    setInterfaceAudioEnabled(enabled);
    if (enabled) playInterfaceCue('confirm');
  };

  const saveApiToken = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiToken.trim()) return;
    try {
      setApiToken(apiToken);
      setApiTokenValue('');
      setHasApiToken(true);
      setApiStatus('Token de sesión guardado.');
    } catch (error) {
      setApiStatus(error instanceof Error ? error.message : 'No se pudo guardar el token.');
    }
  };

  return (
    <aside aria-label="Ajustes rápidos de interfaz" className="fixed left-3 top-3 z-[10001] flex max-w-[calc(100vw-7rem)] items-center gap-2 border border-[var(--sentra-accent)]/30 bg-[#05090a]/95 p-1.5 font-mono text-[10px] shadow-lg backdrop-blur sm:left-4 sm:top-4">
      <label className="sr-only" htmlFor="sentra-theme-select">Tema visual</label>
      <select
        id="sentra-theme-select"
        value={theme}
        onChange={(event) => setTheme(event.target.value as SentraTheme)}
        className="min-h-9 min-w-0 max-w-40 border border-[var(--sentra-accent)]/25 bg-transparent px-2 text-[10px] text-[var(--sentra-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--sentra-accent)]"
      >
        {THEMES.map((option) => <option key={option.id} value={option.id} className="bg-[#05090a] text-white">{option.label}</option>)}
      </select>
      <label className="flex min-h-9 shrink-0 items-center gap-1.5 px-1 text-[var(--sentra-text)]">
        <input
          type="checkbox"
          checked={audioEnabled}
          onChange={(event) => handleAudioChange(event.target.checked)}
          className="h-4 w-4 accent-[var(--sentra-accent)]"
        />
        Audio
      </label>
      <button type="button" onClick={() => setShowApiAccess((open) => !open)} aria-expanded={showApiAccess} aria-controls="sentra-api-access" className="min-h-9 border border-[var(--sentra-accent)]/25 px-2 text-[10px] text-[var(--sentra-text)] hover:bg-white/5">
        API {hasApiToken ? '●' : '○'}
      </button>
      {showApiAccess && (
        <form id="sentra-api-access" onSubmit={saveApiToken} className="absolute left-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] border border-[var(--sentra-accent)]/35 bg-[#05090a] p-3 font-mono text-[10px] shadow-xl">
          <label htmlFor="sentra-api-token" className="block text-[var(--sentra-text)]">Token de acceso al backend</label>
          <input id="sentra-api-token" type="password" autoComplete="current-password" value={apiToken} onChange={(event) => setApiTokenValue(event.target.value)} className="mt-2 min-h-10 w-full border border-[var(--sentra-accent)]/25 bg-black px-2 text-[var(--sentra-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--sentra-accent)]" />
          <div className="mt-2 flex justify-between gap-2">
            <button type="submit" disabled={!apiToken.trim()} className="min-h-9 border border-[var(--sentra-accent)]/40 px-3 text-[var(--sentra-text)] disabled:opacity-40">Conectar</button>
            <button type="button" onClick={() => { setApiToken(''); setApiTokenValue(''); setHasApiToken(false); setApiStatus('Token de sesión eliminado.'); }} disabled={!hasApiToken} className="min-h-9 border border-rose-400/30 px-3 text-rose-200 disabled:opacity-40">Desconectar</button>
          </div>
          <p className="mt-2 text-[#91a59c]" role="status" aria-live="polite">{apiStatus || (hasApiToken ? 'Token activo solo en esta pestaña.' : 'Introduce el token configurado en el servidor.')}</p>
        </form>
      )}
    </aside>
  );
}
