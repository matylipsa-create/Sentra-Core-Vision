import { useEffect, useState } from 'react';
import {
  isInterfaceAudioEnabled,
  playInterfaceCue,
  setInterfaceAudioEnabled,
} from '../lib/engineSound';

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
    </aside>
  );
}
