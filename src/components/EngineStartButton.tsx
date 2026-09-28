import { useCallback, useEffect, useRef, useState } from 'react';
import { playEngineRoar } from '../lib/engineSound';

export function EngineStartButton() {
  const [isRunning, setIsRunning] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  const handleStart = useCallback(() => {
    if (isRunning) return;
    const durationMs = playEngineRoar();
    setIsRunning(true);
    timeoutRef.current = window.setTimeout(() => {
      setIsRunning(false);
    }, Math.max(durationMs, 1200));
  }, [isRunning]);

  return (
    <div className="relative flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleStart}
        disabled={isRunning}
        data-interface-sound="skip"
        aria-label={isRunning ? 'Motor en marcha' : 'Encender motor'}
        className={`relative rounded-full border-2 px-8 py-3 font-mono text-sm font-bold tracking-[0.2em] transition-all duration-300 ${
          isRunning
            ? 'border-[#00ffcc] bg-[#00ffcc]/20 text-[#00ffcc] shadow-[0_0_25px_rgba(0,255,204,0.6)]'
            : 'border-[#00ffcc]/60 bg-[#00ffcc]/5 text-[#00ffcc]/90 shadow-[0_0_12px_rgba(0,255,204,0.25)] hover:border-[#00ffcc] hover:bg-[#00ffcc]/15 hover:shadow-[0_0_20px_rgba(0,255,204,0.45)]'
        }`}
      >
        {isRunning ? 'MOTOR EN MARCHA' : 'MOTOR'}
      </button>

      <div aria-hidden="true" className="pointer-events-none relative h-28 w-28">
        <svg
          viewBox="0 0 200 200"
          className={`h-full w-full transition-opacity duration-500 ${isRunning ? 'opacity-100' : 'opacity-25'}`}
        >
          {Array.from({ length: 6 }).map((_, index) => {
            const angle = (index * 360) / 6;
            return (
              <g
                key={index}
                style={{
                  transformOrigin: '100px 100px',
                  transform: `rotate(${angle}deg)`,
                }}
              >
                <rect
                  x="94"
                  y={isRunning ? 18 : 4}
                  width="12"
                  height="34"
                  rx="3"
                  className="fill-[#00ffcc]"
                  style={{
                    opacity: isRunning ? 0.9 : 0.35,
                    transition: 'y 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease',
                  }}
                />
              </g>
            );
          })}
          <circle
            cx="100"
            cy="100"
            r="26"
            className="fill-none stroke-[#00ffcc]"
            strokeWidth="3"
            strokeDasharray="8 6"
            style={{
              transformOrigin: '100px 100px',
              animation: isRunning ? 'engine-core-spin 0.6s linear infinite' : 'none',
              opacity: isRunning ? 1 : 0.4,
            }}
          />
          <circle
            cx="100"
            cy="100"
            r="10"
            className="fill-[#00ffcc]"
            style={{ opacity: isRunning ? 0.8 : 0.3 }}
          />
        </svg>
      </div>

      <style>{`
        @keyframes engine-core-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default EngineStartButton;