import { useServiceQuery } from './useServiceQuery.js';
import { getCurrentAdviser, getCurrentClient } from '../services/clientService.js';

/** The signed-in (or demo) client. */
export function useCurrentClient() {
  return useServiceQuery(() => getCurrentClient(), []);
}

/** The signed-in (or demo) adviser. */
export function useCurrentAdviser() {
  return useServiceQuery(() => getCurrentAdviser(), []);
}
