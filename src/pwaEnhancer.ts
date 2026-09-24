const ENHANCER_STYLE_ID = 'sentra-pwa-enhancer-styles';
const NETWORK_BADGE_ID = 'sentra-network-badge';

function injectStyles(): void {
  if (document.getElementById(ENHANCER_STYLE_ID)) return;

  const styleElement = document.createElement('style');
  styleElement.id = ENHANCER_STYLE_ID;
  styleElement.textContent = `
    #sentra-network-badge {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: #ffffff;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 9999px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0.9;
    }
    #sentra-network-badge.offline {
      background: rgba(220, 38, 38, 0.9);
      border-color: rgba(239, 68, 68, 0.4);
    }
    #sentra-network-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #10b981;
      box-shadow: 0 0 8px #10b981;
      transition: background-color 0.3s ease;
    }
    #sentra-network-badge.offline #sentra-network-dot {
      background-color: #fef08a;
      box-shadow: 0 0 8px #fef08a;
    }
    .sentra-interactive {
      transition: transform 0.15s ease, opacity 0.15s ease;
      cursor: pointer;
    }
    .sentra-interactive:active {
      transform: scale(0.97);
      opacity: 0.85;
    }
  `;
  document.head.appendChild(styleElement);
}

function setupNetworkMonitor(): void {
  if (document.getElementById(NETWORK_BADGE_ID)) return;

  const badge = document.createElement('div');
  badge.id = NETWORK_BADGE_ID;
  badge.setAttribute('role', 'status');
  badge.setAttribute('aria-live', 'polite');
  badge.innerHTML = `
    <div id="sentra-network-dot" aria-hidden="true"></div>
    <span id="sentra-network-text"></span>
  `;
  document.body.appendChild(badge);

  const text = badge.querySelector<HTMLSpanElement>('#sentra-network-text');
  const updateStatus = (): void => {
    const online = navigator.onLine;
    badge.classList.toggle('offline', !online);
    if (text) text.textContent = online ? 'SENTRA: SECURE NODE' : 'SENTRA: OFFLINE MESH';
  };

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();
}

function enhanceElements(): void {
  document.querySelectorAll('button, .card, [role="button"]').forEach((element) => {
    element.classList.add('sentra-interactive');
  });
}

export function initializePwaEnhancer(): void {
  injectStyles();
  setupNetworkMonitor();
  enhanceElements();

  const observer = new MutationObserver(enhanceElements);
  observer.observe(document.body, { childList: true, subtree: true });
}