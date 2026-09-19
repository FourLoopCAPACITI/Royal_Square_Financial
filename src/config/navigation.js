import {
  BookUser, Briefcase, Building2, ClipboardCheck, FileText, Inbox, LayoutDashboard,
  ListChecks, MessageCircle, Sparkles, Target, UserRound, Users, Workflow, ShieldAlert, Bell,
} from 'lucide-react';

export const CLIENT_NAV = [
  { to: '/client', label: 'Dashboard', icon: LayoutDashboard, end: true, mobile: true },
  { to: '/client/actions', label: 'My Actions', icon: ListChecks, mobile: true },
  { to: '/client/notifications', label: 'Notifications', icon: Bell },
  { to: '/client/goals', label: 'Goals', icon: Target },
  { to: '/client/documents', label: 'Documents', icon: FileText, mobile: true },
  { to: '/client/claims', label: 'Claims', icon: ShieldAlert, mobile: true },
  { to: '/client/requests', label: 'Requests', icon: ClipboardCheck },
  { to: '/client/life-events', label: 'Life Events', icon: Sparkles },
  { to: '/client/chat', label: 'Chat Assistant', icon: MessageCircle },
  { to: '/client/profile', label: 'Profile', icon: UserRound },
];

export const ADVISER_NAV = [
  { to: '/adviser', label: 'Dashboard', icon: LayoutDashboard, end: true, mobile: true },
  { to: '/adviser/actions', label: 'Action Inbox', icon: Inbox, mobile: true },
  { to: '/adviser/notifications', label: 'Notifications', icon: Bell },
  { to: '/adviser/clients', label: 'Clients', icon: Users, mobile: true },
  { to: '/adviser/workflows', label: 'Workflows', icon: Workflow, mobile: true },
  { to: '/adviser/goals', label: 'Goals', icon: Target },
  { to: '/adviser/documents', label: 'Documents', icon: FileText },
  { to: '/adviser/claims', label: 'Claims', icon: ShieldAlert },
  { to: '/adviser/requests', label: 'Client Requests', icon: BookUser },
  { to: '/adviser/providers', label: 'Providers', icon: Building2 },
  { to: '/adviser/chat', label: 'Chat Assistant', icon: MessageCircle },
  { to: '/adviser/profile', label: 'Profile', icon: Briefcase },
];

export function navFor(role) {
  return role === 'adviser' || role === 'admin' ? ADVISER_NAV : CLIENT_NAV;
}
