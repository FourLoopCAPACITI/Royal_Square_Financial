import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNotifications } from '../src/utils/notifications.js';

const now = Date.parse('2026-09-19T12:00:00Z');
const data = {
  role: 'client', recipientId: 'c1',
  clients: [
    { id: 'c1', name: 'Client One', adviserIds: ['a1', 'a2'] },
    { id: 'c2', name: 'Client Two', adviserIds: ['a2'] },
  ],
  tasks: [
    { id: 't1', clientId: 'c1', title: 'Upload income', status: 'open', assignee: 'client', workflowId: 'w1', dueDate: '2026-09-20T12:00:00Z' },
    { id: 't2', clientId: 'c2', title: 'Private task', status: 'open', assignee: 'client' },
    { id: 't3', clientId: 'c1', title: 'Review income', status: 'open', assignee: 'adviser', adviserId: 'a1' },
    { id: 't4', clientId: 'c1', title: 'Other adviser', status: 'open', assignee: 'adviser', adviserId: 'a2' },
  ],
  reminders: [
    { id: 'r1', clientId: 'c1', title: 'Due reminder', remindAt: '2026-09-19T12:00:00Z' },
    { id: 'r2', clientId: 'c1', title: 'Upcoming reminder', remindAt: '2026-09-26T12:00:00Z' },
    { id: 'r3', clientId: 'c1', title: 'Future reminder', remindAt: '2026-09-26T12:00:01Z' },
    { id: 'r4', clientId: 'c2', title: 'Private reminder', remindAt: '2026-09-19T12:00:00Z' },
  ],
  documents: [
    { id: 'd1', clientId: 'c1', name: 'Income statement', status: 'under_review', uploadedAt: '2026-09-18T12:00:00Z' },
    { id: 'd2', clientId: 'c2', name: 'Private document', status: 'missing' },
  ],
};
const build = (overrides = {}, time = now) => buildNotifications({ ...data, ...overrides }, time);

test('clients receive only their own tasks, documents and reminders', () => {
  assert.deepEqual(new Set(build().map((item) => item.title)), new Set(['Upload income', 'Income statement', 'Due reminder', 'Upcoming reminder']));
  assert.equal(build().find((item) => item.taskId === 't1').to, '/workflow/w1');
});

test('advisers receive assigned clients, excluding tasks assigned to a different adviser', () => {
  const inbox = build({ role: 'adviser', recipientId: 'a1' });
  assert.equal(inbox.filter((item) => item.kind === 'task').length, 1);
  assert.equal(inbox.find((item) => item.kind === 'task').title, 'Review income');
  assert.ok(inbox.every((item) => item.clientName === 'Client One'));
  assert.equal(inbox.find((item) => item.kind === 'document').to, '/adviser/documents?filter=all');
  assert.deepEqual(build({ role: 'adviser', recipientId: 'unassigned' }), []);
});

test('reminders become available within seven days and get a new unread version when due', () => {
  const reminders = build().filter((item) => item.kind === 'reminder');
  assert.equal(reminders.length, 2);
  assert.equal(reminders.find((item) => item.title === 'Due reminder').urgent, true);
  const upcoming = reminders.find((item) => item.title === 'Upcoming reminder');
  const due = build({}, now + 7 * 86400000).find((item) => item.title === upcoming.title);
  assert.notEqual(due.id, upcoming.id);
});

test('stable documents preserve read identity; status, metadata and uploads create a new version', () => {
  const id = build().find((item) => item.kind === 'document').id;
  assert.equal(build().find((item) => item.kind === 'document').id, id);
  for (const change of [{ status: 'current' }, { name: 'New name' }, { updatedAt: '2026-09-19T12:00:00Z' }, { storagePath: 'new-file.pdf' }, { expiryDate: '2027-01-01' }]) {
    const changed = build({ documents: [{ ...data.documents[0], ...change }] });
    assert.notEqual(changed.find((item) => item.kind === 'document').id, id);
  }
});

test('completed tasks and their linked reminders leave the inbox', () => {
  const inbox = build({
    tasks: [{ ...data.tasks[0], status: 'done' }],
    reminders: [{ ...data.reminders[0], taskId: 't1' }],
  });
  assert.ok(inbox.every((item) => item.kind === 'document'));
});

test('overdue tasks become urgent with a new unread version', () => {
  const task = build().find((item) => item.taskId === 't1');
  const overdue = build({}, now + 2 * 86400000).find((item) => item.taskId === 't1');
  assert.equal(overdue.urgent, true);
  assert.notEqual(task.id, overdue.id);
});

test('no records produces a valid empty inbox', () => {
  assert.deepEqual(build({ tasks: [], reminders: [], documents: [] }), []);
});
