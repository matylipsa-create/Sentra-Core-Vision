import { useEffect, useState } from 'react';
import { SentraCoreDashboard } from './components/SentraCoreDashboard';
import { VisionScreen } from './components/VisionScreen';
import { VisionOnboarding } from './components/VisionOnboarding';
import { AppProvider } from './context/AppContext';

function getRoute(): string {
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

export default function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (nextRoute: string) => {
    window.history.pushState({}, '', nextRoute);
    setRoute(nextRoute);
  };

  if (route === '/core') {
    return (
      <>
        <nav className="fixed right-4 top-4 z-10">
          <button type="button" onClick={() => navigate('/')} className="rounded border border-[#00ffcc]/50 bg-[#050507]/90 px-3 py-2 font-mono text-xs text-[#00ffcc] hover:bg-[#00ffcc] hover:text-black">
            VOLVER A VISIÓN
          </button>
        </nav>
        <SentraCoreDashboard />
      </>
    );
  }

  return (
    <>
      <nav className="fixed right-4 top-4 z-10">
        <button type="button" onClick={() => navigate('/core')} className="rounded border border-[#00ffcc]/50 bg-[#050507]/90 px-3 py-2 font-mono text-xs text-[#00ffcc] hover:bg-[#00ffcc] hover:text-black">
          ABRIR SENTRA CORE
        </button>
      </nav>
      <AppProvider>
        <VisionOnboarding><VisionScreen /></VisionOnboarding>
      </AppProvider>
    </>
  );
}
