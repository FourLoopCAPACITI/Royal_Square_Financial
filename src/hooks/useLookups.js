import { useServiceQuery } from './useServiceQuery.js';
import { listClients, listProviders } from '../services/clientService.js';

/** Provider and client name lookups for cards and lists. */
export function useLookups() {
  const providers = useServiceQuery(() => listProviders(), []);
  const clients = useServiceQuery(() => listClients(), []);
  const providerName = (id) => providers.data?.find((p) => p.id === id)?.name || null;
  const clientName = (id) => clients.data?.find((c) => c.id === id)?.name || null;
  return { providers: providers.data || [], clients: clients.data || [], providerName, clientName, loading: providers.loading || clients.loading };
}
