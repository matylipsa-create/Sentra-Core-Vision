const TOKEN_KEY = 'sentra_api_access_token';
export const API_TOKEN_CHANGED_EVENT = 'sentra-api-token-changed';

export function getApiToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setApiToken(token: string): void {
  try {
    const normalized = token.trim();
    if (normalized) window.sessionStorage.setItem(TOKEN_KEY, normalized);
    else window.sessionStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event(API_TOKEN_CHANGED_EVENT));
  } catch {
    throw new Error('No se pudo guardar el token en la sesión del navegador');
  }
}