import type { Api } from '../../types/index.js';

declare global {
  interface Window {
    api: Api;
  }
}

/**
 * Returns the typed API bridge exposed by the Electron preload script.
 */
export function useApi(): Api {
  if (!window.api) {
    throw new Error('window.api is not available. Ensure the preload script is loaded.');
  }
  return window.api;
}
