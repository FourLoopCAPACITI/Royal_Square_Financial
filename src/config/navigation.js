import {
  BookUser, Briefcase, Building2, ClipboardCheck, FileText, Inbox, LayoutDashboard,
  ListChecks, MessageCircle, Sparkles, Target, UserRound, Users, Workflow, ShieldAlert,
} from 'lucide-react';

/** labelKey / shortKey are i18n keys (see src/i18n); components render them with t(). */
export const CLIENT_NAV = [
  { to: '/client', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true, mobile: true },
  { to: '/client/actions', labelKey: 'nav.myActions', shortKey: 'nav.myActions.short', icon: ListChecks, mobile: true },
  { to: '/client/goals', labelKey: 'nav.goals', icon: Target },
  { to: '/client/documents', labelKey: 'nav.documents', icon: FileText, mobile: true },
  { to: '/client/claims', labelKey: 'nav.claims', icon: ShieldAlert, mobile: true },
  { to: '/client/requests', labelKey: 'nav.requests', icon: ClipboardCheck },
  { to: '/client/life-events', labelKey: 'nav.lifeEvents', icon: Sparkles },
  { to: '/client/chat', labelKey: 'nav.chat', icon: MessageCircle },
  { to: '/client/profile', labelKey: 'nav.profile', icon: UserRound },
];

export const ADVISER_NAV = [
  { to: '/adviser', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true, mobile: true },
  { to: '/adviser/actions', labelKey: 'nav.actionInbox', shortKey: 'nav.actionInbox.short', icon: Inbox, mobile: true },
  { to: '/adviser/clients', labelKey: 'nav.clients', icon: Users, mobile: true },
  { to: '/adviser/workflows', labelKey: 'nav.workflows', icon: Workflow, mobile: true },
  { to: '/adviser/goals', labelKey: 'nav.goals', icon: Target },
  { to: '/adviser/documents', labelKey: 'nav.documents', icon: FileText },
  { to: '/adviser/claims', labelKey: 'nav.claims', icon: ShieldAlert },
  { to: '/adviser/requests', labelKey: 'nav.clientRequests', icon: BookUser },
  { to: '/adviser/providers', labelKey: 'nav.providers', icon: Building2 },
  { to: '/adviser/chat', labelKey: 'nav.chat', icon: MessageCircle },
  { to: '/adviser/profile', labelKey: 'nav.profile', icon: Briefcase },
];

export function navFor(role) {
  return role === 'adviser' || role === 'admin' ? ADVISER_NAV : CLIENT_NAV;
}

