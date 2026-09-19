# Royal Square Financial

Hackathon foundation for **Royal Square Financial**, a South African independent financial brokerage. One system, two experiences: a **Client Portal** and an **Adviser Portal**, joined by a reusable **workflow engine**.

## Project purpose

Royal Square advisers lose hours to admin: chasing documents, following up with clients and providers, compliance reminders, claims, policy changes and progress updates. Clients, meanwhile, rarely know where their request stands.

This project is built around one question:

> **Who's holding the ball?**

Every active process (a claim, a change of address, an annual review) always shows its **current owner** (client, adviser, provider, repairer or system), **current step**, **next action**, **due date**, **status** and **progress**. The client and adviser always know what is happening, what happens next and who is responsible.

The design is workflow- and action-first, not an analytics dashboard.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18, Vite 5, **JavaScript only** (no TypeScript), Tailwind CSS 3, React Router 6, Lucide React |
| Data | Supabase: PostgreSQL, Auth, Storage (optional: mock data fallback) |
| FAQ Bot | Hardcoded, client-side FAQ matching (`src/data/faqs.js`); no AI, no API |
| Deploy | Vercel |
| Future mobile | Capacitor (architecture prepared, no native projects yet) |

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173. **No environment variables are needed** to run it: without Supabase the app uses `src/data/mockData.js`, and the FAQ Bot is fully client-side, so it needs no API key or internet connection.

Click **Client portal** or **Adviser portal** on the landing page, or use the **demo bar** at the top of the app to switch views, toggle Online/Offline and reset demo data.

Other scripts:

```bash
npm run build           # production build to dist/
npm run preview         # serve the build
npm run seed:generate   # regenerate supabase/seed.sql from src/data/mockData.js
```

## Environment variables

Copy `.env.example` to `.env.local`.

| Variable | Where it runs | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Browser | Supabase project URL (Project Settings → API). |
| `VITE_SUPABASE_ANON_KEY` | Browser | Supabase anon/public key. Safe in the browser because RLS protects the data. |
| `VITE_ENABLE_DEMO_MODE` | Browser | `true` shows the Client/Adviser demo switch. **Set to `false` before a real launch.** |

The Supabase **service-role key must never** be added to this frontend.

On Vercel: Project → Settings → Environment Variables, add the same names.

## Database setup (Supabase)

1. Create a new Supabase project.
2. SQL Editor → paste **`supabase/schema.sql`** → Run. This creates 20 tables, indexes, `updated_at` triggers, the auth → profile trigger, RLS helper functions, RLS policies and the two private storage buckets.
3. SQL Editor → paste **`supabase/seed.sql`** → Run. Loads the fictional demo data (5 clients, 2 advisers, 5 providers, 7 workflows, a detailed motor claim, goals, tasks, documents, requests and the activity timeline). Dates are relative to the day you run it. Safe to re-run.
4. Authentication → Users → **Add user** with these emails (any password, tick auto-confirm):
   - Client: `lerato.molefe@example.demo`
   - Adviser: `sipho.ndlovu@royalsquare.demo` (or `michelle.vdm@royalsquare.demo`)

   The `on_auth_user_created` trigger creates a profile and links it to the seeded client/adviser row with the same email. Advisers get the `adviser` role only because their email exists in `public.advisers`, which only admins can write. Everyone else signs up as `client`.
5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local`, restart `npm run dev`, and sign in at `/login`.
6. To create an admin: `update public.profiles set role = 'admin' where email = '...';` in the SQL Editor.

**Existing project?** If you created the database before language support was added, run **`supabase/add_profile_language.sql`** once. It adds `profiles.language` (`en` / `af` / `zu`, default `en`). Until then the app still works; the language is just remembered per device instead of per user.

Data mode: **Supabase configured and a user signed in → Supabase. Otherwise → mock data.** See `src/services/dataSource.js`.

Both SQL files were executed against PostgreSQL 16 with a Supabase-style `auth`/`storage` shim, including RLS tests for a client, two advisers and an unassigned user.

### Row Level Security

RLS is enabled on every table. Helper functions in `schema.sql` (`can_access_client`, `is_staff_for_client`, `is_admin`, …) are `SECURITY DEFINER` so policies don't recurse.

| Who | Can access |
|---|---|
| Client | Their own profile, client record, products, goals (own + household), workflows and steps, tasks, reminders, documents, claims and evidence, service requests, activity and chat. Can create workflows/requests/documents/evidence for themselves only. |
| Adviser | Only clients assigned via `client_adviser_assignments`, plus those clients' records. Can read their clients' chat conversations. |
| Admin | Everything. Only admins can change roles, providers, advisers or assignments. |
| Any signed-in user | Provider list (reference data). |

`activity_events` is append-only for non-admins. A trigger stops anyone but an admin from changing a profile's role.

Starter note: clients can update their own workflow steps so the prototype's "I've done this" button works. For production, move step transitions into a Postgres function or Edge Function that validates each transition.

### Storage

Two **private** buckets:

```
client-documents/{client_id}/licences|policies|identity|address|general/{file}
claim-evidence/{client_id}/{claim_id}/{file}
```

Storage policies check that the first folder is a client UUID the user may access. Read files with signed URLs. Path helpers: `src/services/supabase.js`.

## Architecture

```
Client UI / Adviser UI   (src/pages, src/components)
          ↓
Hooks                    (src/hooks: useServiceQuery, useLookups, useCurrentUser)
          ↓
Services                 (src/services/*Service.js)
          ↓                          ↘
Workflow engine          Supabase (Postgres/Auth/Storage)  or  mock store (localStorage)
(src/utils/workflow.js)
          ↓
Provider adapter / mock integration   (providers.integration_mode = 'mock')
```

- **Business logic lives outside React.** `src/utils/` holds pure functions; components only render.
- **Workflow engine** (`src/utils/workflow.js`): `getCurrentStep`, `getNextStep`, `getWorkflowProgress`, `advanceWorkflow`, `getCurrentOwner`, `isWorkflowOverdue`, `createWorkflow`, `createActivityEvent`, `groupWorkflowsForInbox`.
- **Templates** (`src/utils/workflowTemplates.js`): motor claim (13 stages), change of address, policy amendment, annual review, bank details, document request, consultation, financial info. Every Client Service Centre request and the "I moved" life event reuse these. **To add a new process, add a template; don't write new logic.**
- **Owner & timelines**: `WorkflowOwner.jsx` (who holds the ball), `WorkflowTimeline.jsx` (✓ ● ○ steps), `ActivityTimeline.jsx` (time-stamped events). Every advance writes an activity event.
- **Mock store** (`src/services/store.js`) persists demo changes in localStorage. Reset from the demo bar.
- **Demo mode** (`SessionContext.jsx`, `DemoBar.jsx`) is clearly marked and removable: set `VITE_ENABLE_DEMO_MODE=false`, then delete `DemoBar.jsx` and the demo-role code in `SessionContext.jsx`.

### In-app notifications

The header bell and Notifications pages show open tasks, reminders due or coming up within seven days, and the latest document statuses. Clients see their own records; advisers see assigned clients and their own or unassigned adviser tasks. Marking an item as read does not complete its task. Tasks can be completed from the full notification inbox.

Document edits/uploads/status changes and task changes create a new unread version of the item. Completed tasks leave the inbox. The feed shows the latest state of each record rather than an audit history. Read status is saved per account and role in this browser; it does not sync across devices. The feed refreshes after local changes, on tab focus/reconnect, and every 30 seconds while visible, including updates made by other users in Supabase. No schema migration is needed.

These are in-app notifications only. Email, SMS and background push delivery are not implemented.

### FAQ Bot

The "Royal Square FAQ Bot" is a hardcoded, informational-only FAQ helper. There is no AI, no server function and no external API call, so it works offline and needs no environment variables.

```
React (ChatPanel) → answerQuestion() in src/data/faqs.js → matched FAQ answer (or fallback)
```

- **Add or edit an FAQ** in one place: `src/data/faqs.js`. Each entry has an `id`, `keywords`, and a question (`q`) and answer (`a`) in `en` / `af` / `zu` (missing translations fall back to English). Set `suggest: true` to show it as a tap-to-ask chip.
- **Matching** is simple keyword matching: keywords found at the start of a word in the user's question are scored (longer phrases score higher) and the best FAQ wins. No match returns a fallback that points the user to their adviser.
- The bot never gives financial, investment, insurance, legal or claims advice. Advice-style questions (e.g. "which fund should I buy?") get the disclaimer answer.
- It works in both the Client and Adviser portals and answers in the selected language.

### Languages (English, Afrikaans, isiZulu)

Everything user-facing goes through `src/i18n`:

- `t('nav.dashboard', { count })` for UI copy (semantic keys, `key_one` / `key_other` for plurals). Use `const { t } = useI18n()` in components; utils and services can import `t` directly.
- `tx('Motor claim')` for text that is stored or generated as English (workflow templates, activity messages, mock data). It is looked up by its English text; entries with `{0}` placeholders match dynamic sentences.
- Copy lives in `src/i18n/locales/{en,af,zu}.js`. English is the default and the fallback for anything missing. To add a page, add its keys to `en.js` (and `af.js` / `zu.js`) and call `t()`; nothing else to wire up. A new language is one more locale file plus an entry in `LANGUAGES` (`src/i18n/index.js`).
- `<LanguageSelect />` is the dropdown. It is on the Client and Adviser profile pages, and on the start and sign-in pages.
- Persistence: signed in → `profiles.language` (shared by clients and advisers, loaded with the session); signed out or demo → this device's localStorage.
- FAQ Bot: answers come from `src/data/faqs.js` in the selected language; anything untranslated falls back to English.

### Offline SOS and Capacitor

```
Accident → no internet → capture evidence locally → save report locally
→ connectivity returns → sync → create claim workflow → notify adviser
```

- `src/services/offlineService.js`: connectivity (+ demo Online/Offline toggle), pending-report queue, auto-saved drafts. Uses localStorage today.
- `src/services/syncService.js`: uploads queued reports on reconnect via `claimService.createClaimFromReport`.
- `src/services/deviceService.js`: simulated camera, GPS and voice recording.

Capacitor swap points (each marked in the code):

| Today (web) | Capacitor |
|---|---|
| `deviceService.capturePhoto` | `@capacitor/camera` |
| `deviceService.getCurrentPosition` | `@capacitor/geolocation` |
| `deviceService` voice recording | a voice recorder plugin |
| `offlineService` localStorage | `@capacitor/preferences` / `@capacitor/filesystem` (photos) |
| `offlineService.onConnectivityChange` | `@capacitor/network` |

Nothing else needs to change: pages only call these services.

## Mock versus real

| Feature | Status |
|---|---|
| Workflow engine, owners, timelines, inbox grouping | **Real** logic (pure JS), works in both data modes |
| Supabase schema, RLS, storage policies, auth trigger | **Real**, tested SQL |
| Supabase data access in services | **Real** when configured and signed in; otherwise mock |
| Client/Adviser demo switch | **Demo only**; remove before launch |
| Provider integrations (Santam, Discovery, …) | **Mock**. Provider steps are advanced by the adviser ("Record update from …" on the workflow page) |
| Claim numbers | **Mock** (`SAN-CLM-DEMO-…`) |
| Camera, GPS, voice recording | **Simulated** (`deviceService.js`) |
| Offline storage and sync | **Simplified** (localStorage + demo toggle) |
| Document OCR / expiry detection | **Simulated** (`documentIntelligence.js`) |
| Reminders (email/SMS) | **Recorded only**, nothing is sent |
| FAQ Bot | **Real**, hardcoded FAQs, fully client-side |
| People, ID numbers, policies | **Fictional** |

## Routes

```
/                       landing          /adviser              adviser dashboard
/login                  Supabase sign-in /adviser/actions      Action Inbox
/client                 dashboard        /adviser/clients
/client/actions                          /adviser/workflows
/client/goals                            /adviser/goals
/client/documents                        /adviser/documents
/client/claims                           /adviser/claims
/client/requests                         /adviser/requests
/client/life-events                      /adviser/providers
/client/chat                             /adviser/chat
/client/profile                          /adviser/profile
/workflow/:id           any workflow (client or adviser view)
/accident-assist        10-step Accident Assist
```

## Folder structure

```
public/                 logo, favicon
scripts/                generate-seed.mjs
src/
  components/           common, layout, dashboard, workflows, claims, documents, goals, chat, adviser
  config/               env.js, navigation.js
  context/              SessionContext, ConnectivityContext
  data/mockData.js      demo data (source of truth for seed.sql)
  hooks/
  pages/                client/, adviser/, shared pages
  routes/               AppRoutes, clientRoutes, adviserRoutes
  services/             one file per domain + supabase/offline/sync
  utils/                workflow engine, templates, formatting, documents, claims
supabase/               schema.sql, seed.sql
```

## Team workflow (4 people)

Suggested branches and ownership:

| Branch | Owns |
|---|---|
| `feature/client-ui` | `src/pages/client/`, `src/components/dashboard`, `goals`, `documents`, `routes/clientRoutes.jsx` |
| `feature/workflow-engine` | `src/utils/workflow.js`, `workflowTemplates.js`, `src/components/workflows/`, `workflowService.js`, adviser pages |
| `feature/supabase-data` | `supabase/`, `src/services/*` data access, `mappers.js`, `scripts/` |
| `feature/accident-assist` | `src/pages/AccidentAssist.jsx`, `src/components/claims/`, `claimService`, `offlineService`, `syncService`, `deviceService` |

Guidelines to avoid merge conflicts:

- Keep `App.jsx` small. Add routes in `clientRoutes.jsx` / `adviserRoutes.jsx`, not in `App.jsx`.
- One component or service per file; avoid unrelated features sharing a file.
- Put rules in `src/utils`, data access in `src/services`, UI in `src/components`/`src/pages`.
- If you change a column, update `schema.sql`, `mappers.js` and `mockData.js`, then run `npm run seed:generate`.
- Short-lived branches, small PRs, rebase on `main` daily.

## Brand

Colours come from the Royal Square Financial logo (`public/royal-square-logo.jpg`), defined as CSS variables in `src/index.css` and in `tailwind.config.js`: red `#9A1C20`, black `#0A0A0A`, white, grey `#747474`, light grey `#F5F5F5`, border `#E5E5E5`. Green for success, amber for warnings. No gradients.
