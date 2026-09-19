import { Briefcase, CalendarDays, Car, ClipboardList, FileText, Heart, Home, Landmark, Receipt, Sunset, TriangleAlert, Circle } from 'lucide-react';

const ICONS = { Briefcase, CalendarDays, Car, ClipboardList, FileText, Heart, Home, Landmark, Receipt, Sunset, TriangleAlert };

/** Render a Lucide icon by name (used by data-driven lists like templates and life events). */
export default function NamedIcon({ name, ...props }) {
  const Icon = ICONS[name] || Circle;
  return <Icon aria-hidden="true" {...props} />;
}
