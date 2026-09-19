import { getCurrentAdviser, getCurrentClient, listClients } from './clientService.js';
import { listDocuments } from './documentService.js';
import { listReminders, listTasks } from './taskService.js';
import { buildNotifications } from '../utils/notifications.js';

export async function listNotifications(role) {
  if (!['client', 'adviser'].includes(role)) return [];
  const recipient = await (role === 'client' ? getCurrentClient() : getCurrentAdviser());
  if (!recipient) throw new Error('Your profile could not be found');
  const scope = role === 'client' ? { clientId: recipient.id } : { adviserId: recipient.id };
  const [clients, tasks, reminders, documents] = await Promise.all([
    role === 'client' ? [recipient] : listClients(scope),
    listTasks({ ...scope, status: null }), listReminders(scope), listDocuments(scope),
  ]);
  return buildNotifications({ role, recipientId: recipient.id, clients, tasks, reminders, documents });
}

export function notificationReadKey(scope) {
  return `rsf-notifications-read-v1:${scope}`;
}

export function readNotificationIds(scope) {
  try {
    const value = JSON.parse(localStorage.getItem(notificationReadKey(scope)) || '[]');
    return new Set(Array.isArray(value) ? value.filter((id) => typeof id === 'string') : []);
  } catch { return new Set(); }
}

export function saveNotificationIds(scope, ids) {
  try { localStorage.setItem(notificationReadKey(scope), JSON.stringify([...ids])); } catch { /* In-memory state still works. */ }
}
