/** Clients, advisers, providers, households and products. */
import { supabase } from './supabase.js';
import { useSupabase } from './dataSource.js';
import { getState, simulateLatency } from './store.js';
import { mapClient, mapProvider } from './mappers.js';
import { DEMO_ADVISER_ID, DEMO_CLIENT_ID } from '../data/mockData.js';

const CLIENT_SELECT = '*, client_adviser_assignments(adviser_id), household_members(household_id)';

/** The signed-in client's record (demo: Lerato Molefe). */
export async function getCurrentClient() {
  if (await useSupabase()) {
    const { data: auth } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('clients').select(CLIENT_SELECT).eq('profile_id', auth.user.id).maybeSingle();
    if (error) throw error;
    return mapClient(data);
  }
  await simulateLatency();
  return getState().clients.find((c) => c.id === DEMO_CLIENT_ID) || null;
}

/** The signed-in adviser's record (demo: Sipho Ndlovu). */
export async function getCurrentAdviser() {
  if (await useSupabase()) {
    const { data: auth } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('advisers').select('*').eq('profile_id', auth.user.id).maybeSingle();
    if (error) throw error;
    return data ? { id: data.id, name: data.full_name, email: data.email, phone: data.phone, fspRepNumber: data.fsp_rep_number } : null;
  }
  await simulateLatency();
  return getState().advisers.find((a) => a.id === DEMO_ADVISER_ID) || null;
}

export async function getClient(clientId) {
  if (await useSupabase()) {
    const { data, error } = await supabase.from('clients').select(CLIENT_SELECT).eq('id', clientId).maybeSingle();
    if (error) throw error;
    return mapClient(data);
  }
  await simulateLatency();
  return getState().clients.find((c) => c.id === clientId) || null;
}

/** Clients assigned to an adviser. RLS already restricts this in Supabase. */
export async function listClients({ adviserId } = {}) {
  if (await useSupabase()) {
    const { data, error } = await supabase.from('clients').select(CLIENT_SELECT).order('last_name');
    if (error) throw error;
    return data.map(mapClient);
  }
  await simulateLatency();
  const { clients } = getState();
  return adviserId ? clients.filter((c) => c.adviserIds.includes(adviserId)) : clients;
}

export async function listAdvisers() {
  if (await useSupabase()) {
    const { data, error } = await supabase.from('advisers').select('*').order('full_name');
    if (error) throw error;
    return data.map((a) => ({ id: a.id, name: a.full_name, email: a.email, phone: a.phone }));
  }
  await simulateLatency();
  return getState().advisers;
}

export async function listProviders() {
  if (await useSupabase()) {
    const { data, error } = await supabase.from('providers').select('*').order('name');
    if (error) throw error;
    return data.map(mapProvider);
  }
  await simulateLatency();
  return getState().providers;
}

export async function listClientProducts(clientId) {
  if (await useSupabase()) {
    const { data, error } = await supabase.from('client_products').select('*').eq('client_id', clientId);
    if (error) throw error;
    return data.map((p) => ({ id: p.id, clientId: p.client_id, providerId: p.provider_id, type: p.product_type, policyNumber: p.policy_number, description: p.description }));
  }
  await simulateLatency();
  return getState().clientProducts.filter((p) => p.clientId === clientId);
}

export async function getHousehold(householdId) {
  if (!householdId) return null;
  if (await useSupabase()) {
    const { data, error } = await supabase.from('households').select('*, household_members(client_id)').eq('id', householdId).maybeSingle();
    if (error) throw error;
    return data ? { id: data.id, name: data.name, memberIds: data.household_members.map((m) => m.client_id) } : null;
  }
  await simulateLatency();
  return getState().households.find((h) => h.id === householdId) || null;
}

/** Synchronous lookups for mock mode labels (provider names on cards, etc.). */
export function lookupProviderName(providerId, providers) {
  const list = providers || getState().providers;
  return list.find((p) => p.id === providerId)?.name || null;
}

export function lookupClientName(clientId, clients) {
  const list = clients || getState().clients;
  return list.find((c) => c.id === clientId)?.name || null;
}
