import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, CloudOff, MapPin, MessageCircle, Users, WifiOff } from 'lucide-react';
import Logo from '../components/common/Logo.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';

const roadmapItems = [
  {
    icon: WifiOff,
    title: 'Built for when there\'s no signal',
    description: 'We are expanding the existing offline Accident Assist capability into a broader offline-first mode covering more emergency and time-sensitive tasks. Clients will be able to capture critical information the moment something happens, with automatic syncing once connectivity returns.',
    visualLabel: 'Offline emergency capture',
    details: [CloudOff, WifiOff],
  },
  {
    icon: MessageCircle,
    title: 'Report an incident without opening the app',
    description: 'A WhatsApp-based bot will walk clients through capturing an accident or incident on the spot, including photos, location, and witness details, entirely inside a chat. The captured information can then hand off into the full app or portal for tracking, lowering the barrier for the first, most stressful step.',
    visualLabel: 'Chat-based incident report',
    details: [Camera, MapPin, Users],
  },
];

function FeatureVisual({ icon: Icon, details: DetailIcons, label }) {
  const DetailIcon = DetailIcons[0];

  return (
    <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-lg border border-gold/30 bg-navy px-6 py-8 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(212,175,107,0.12),transparent_58%)]" aria-hidden="true" />
      <div className="relative flex flex-col items-center gap-5">
        <div className="relative grid h-20 w-20 place-items-center rounded-full border border-gold/70 bg-navy-deep text-gold shadow-[0_0_0_10px_rgba(212,175,107,0.08)]">
          <Icon size={38} strokeWidth={1.6} aria-hidden="true" />
          <span className="absolute -right-3 -top-2 grid h-8 w-8 place-items-center rounded-full bg-gold text-navy-deep">
            <DetailIcon size={16} aria-hidden="true" />
          </span>
        </div>
        <div className="flex items-center gap-3 text-gold/90" aria-hidden="true">
          {DetailIcons.slice(1).map((DetailIcon) => (
            <span key={DetailIcon.displayName || DetailIcon.name} className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/10">
              <DetailIcon size={17} />
            </span>
          ))}
        </div>
        <span className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-white/70">{label}</span>
      </div>
    </div>
  );
}

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-brand-light-grey text-brand-black">
      <header className="border-b-2 border-gold/60 bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Logo className="max-w-[210px]" />
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-red transition-colors hover:text-brand-red-dark">
            <ArrowLeft size={17} aria-hidden="true" /> Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <PageHeader
          title="Next patch updates"
          description="A short view of the next product capabilities planned for Royal Square Financial."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {roadmapItems.map(({ icon, title, description, visualLabel, details }) => (
            <article key={title} className="rounded-lg border border-brand-border bg-surface p-5 shadow-card sm:p-7">
              <FeatureVisual icon={icon} details={details} label={visualLabel} />
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-3xl font-semibold leading-tight">{title}</h2>
                <StatusBadge tone="neutral">Coming in Phase 2</StatusBadge>
              </div>
              <p className="mt-4 text-[16.5px] leading-7 text-brand-grey">{description}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}