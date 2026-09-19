const WEEK = 7 * 24 * 60 * 60 * 1000;
const timestamp = (value) => Date.parse(value) || 0;
const version = (kind, item, fields) => JSON.stringify([kind, item.id, ...fields]);

/** Build the current inbox from records the recipient is permitted to see. */
export function buildNotifications({ role, recipientId, clients, tasks, reminders, documents }, now = Date.now()) {
  const adviser = role === 'adviser';
  const base = adviser ? '/adviser' : '/client';
  const names = new Map(clients
    .filter((client) => adviser ? client.adviserIds.includes(recipientId) : client.id === recipientId)
    .map((client) => [client.id, client.name]));
  const inbox = [];
  const context = (item) => adviser ? names.get(item.clientId) : null;

  for (const task of tasks) {
    if (!names.has(task.clientId) || task.status !== 'open' || task.assignee !== role) continue;
    if (adviser && task.adviserId && task.adviserId !== recipientId) continue;
    const overdue = timestamp(task.dueDate) > 0 && timestamp(task.dueDate) < now;
    inbox.push({
      id: version('task', task, [task.updatedAt, task.title, task.description, task.dueDate, task.priority, overdue]),
      kind: 'task', title: task.title, message: task.description || 'This task needs your action.',
      clientName: context(task), label: overdue ? 'Overdue task' : 'Action required',
      urgent: overdue || task.priority === 'high', date: task.dueDate, dateLabel: 'Due',
      to: task.workflowId ? `/workflow/${task.workflowId}` : `${base}/notifications?type=task`,
      taskId: task.id, updatedAt: task.updatedAt || task.createdAt,
    });
  }

  for (const reminder of reminders) {
    const at = timestamp(reminder.remindAt);
    if (!names.has(reminder.clientId) || !at || at > now + WEEK) continue;
    // Reminders tied to a completed task no longer need attention.
    if (reminder.taskId && tasks.some((task) => task.id === reminder.taskId && task.status !== 'open')) continue;
    const due = at <= now;
    inbox.push({
      id: version('reminder', reminder, [reminder.title, reminder.remindAt, reminder.updatedAt, due]),
      kind: 'reminder', title: reminder.title,
      message: due ? 'Your scheduled reminder is due.' : 'Coming up within the next 7 days.',
      clientName: context(reminder), label: due ? 'Reminder due' : 'Upcoming reminder',
      urgent: due, date: reminder.remindAt, dateLabel: 'Scheduled',
      to: reminder.documentId ? `${base}/documents${adviser ? '?filter=all' : ''}` : `${base}/notifications?type=reminder`,
      updatedAt: reminder.remindAt,
    });
  }

  const statuses = {
    missing: 'Upload required', expired: 'Document expired', expiring_soon: 'Document expiring soon',
    under_review: 'Document under review', current: 'Document up to date',
  };
  for (const doc of documents) {
    if (!names.has(doc.clientId)) continue;
    inbox.push({
      id: version('document', doc, [doc.name, doc.type, doc.status, doc.uploadedAt, doc.updatedAt, doc.expiryDate, doc.storagePath]),
      kind: 'document', title: doc.name, label: statuses[doc.status] || 'Document updated',
      message: doc.status === 'missing' ? 'This document still needs to be uploaded.'
        : doc.status === 'under_review' ? 'The uploaded document is awaiting review.'
          : doc.expiryDate ? `Expiry date: ${new Date(doc.expiryDate).toLocaleDateString('en-ZA')}.`
            : 'View the latest document details and status.',
      clientName: context(doc), urgent: ['missing', 'expired'].includes(doc.status),
      date: doc.updatedAt || doc.uploadedAt, dateLabel: doc.updatedAt ? 'Updated' : 'Uploaded',
      to: `${base}/documents${adviser ? '?filter=all' : ''}`,
      updatedAt: doc.updatedAt || doc.uploadedAt,
    });
  }
  return inbox.sort((a, b) => Number(b.urgent) - Number(a.urgent) || timestamp(b.updatedAt) - timestamp(a.updatedAt) || a.id.localeCompare(b.id));
}
