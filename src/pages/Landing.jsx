import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Building2, ChevronLeft, ChevronRight, Clock3, Mail, MapPin, Phone, ShieldCheck, TrendingUp } from 'lucide-react';
import Logo from '../components/common/Logo.jsx';
import Button from '../components/common/Button.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { homeFor } from '../components/layout/ProtectedRoute.jsx';
<<<<<<< HEAD
=======
import { IS_SUPABASE_CONFIGURED } from '../config/env.js';
import { createWorkflow, advanceWorkflow } from '../utils/workflow.js';
import LanguageSelect from '../components/common/LanguageSelect.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
>>>>>>> 74250a30eb6f14e14093a76f53ab1a52636b5cc0

const reasons = [
  {
    icon: ShieldCheck,
    title: 'Secure and transparent',
    description: 'Stay informed with clear progress updates, secure document access, and a visible workflow from start to finish.',
  },
  {
    icon: TrendingUp,
    title: 'Clear next steps',
    description: 'Every service request is mapped to responsibilities, actions, and due dates so nothing gets lost or delayed.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Built for advice',
    description: 'Clients and advisers work from the same source of truth, improving communication and reducing admin friction.',
  },
  {
    icon: Building2,
    title: 'Independent support',
    description: 'Royal Square Financial brings together claims, policy changes, reviews, and service requests in one experience.',
  },
];

const partners = [
  { name: 'Sanlam', className: 'font-semibold tracking-tight text-[#008b82]' },
  { name: 'Old Mutual', className: 'font-semibold tracking-tight text-[#005b9a]' },
  { name: 'Liberty', className: 'font-semibold italic tracking-tight text-[#e3262e]' },
  { name: 'Momentum', className: 'font-semibold tracking-tight text-[#ed1c24]' },
  { name: 'Discovery', className: 'font-semibold tracking-tight text-[#0072bc]' },
  { name: 'Allan Gray', className: 'font-medium tracking-tight text-[#263d69]' },
  { name: 'Santam', className: 'font-semibold tracking-tight text-[#f58220]' },
];

export default function Landing() {
<<<<<<< HEAD
  const { isAuthenticated, role } = useSession();
  const [partnerOffset, setPartnerOffset] = useState(0);
  const orderedPartners = partners.map((_, index) => partners[(index + partnerOffset) % partners.length]);
=======
  const { t } = useI18n();
  const { isAuthenticated, role, demoModeEnabled, setDemoRole } = useSession();
  const navigate = useNavigate();
>>>>>>> 74250a30eb6f14e14093a76f53ab1a52636b5cc0

  if (isAuthenticated && role) return <Navigate to={homeFor(role)} replace />;

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-[#f4f4f4] text-brand-black">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="border-b border-brand-border bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Logo className="max-w-[155px]" />

            <nav className="order-3 flex w-full items-center justify-center gap-5 overflow-x-auto border-t border-brand-border pt-3 text-sm font-semibold text-[#152f66] sm:order-none sm:w-auto sm:border-0 sm:pt-0 sm:gap-6 lg:gap-8" aria-label="Main navigation">
              <a href="#about" className="whitespace-nowrap transition-colors hover:text-brand-red">About us</a>
              <a href="#why-us" className="whitespace-nowrap transition-colors hover:text-brand-red">Why choose us</a>
              <a href="#partners" className="whitespace-nowrap transition-colors hover:text-brand-red">Partners</a>
              <a href="#contact" className="whitespace-nowrap transition-colors hover:text-brand-red">Contact</a>
            </nav>

            <div className="flex items-center gap-2">
              <Button as={Link} to="/signin" variant="secondary" size="sm">
                Sign in
              </Button>
              <Button as={Link} to="/signup" size="sm">
                Sign up
              </Button>
            </div>
          </div>
        </header>

        <main className="mt-8">
          <section className="overflow-hidden rounded-[28px] border border-brand-border bg-white shadow-sm">
            <div className="grid items-center gap-8 px-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-12">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-red">Independent financial brokerage</p>
                <h1 className="mt-4 max-w-xl text-4xl font-light leading-tight tracking-[0.01em] sm:text-5xl">
                  A clearer way to manage your financial journey.
                </h1>
                <p className="mt-5 max-w-xl text-lg text-brand-grey">
                  Royal Square Financial helps clients and advisers stay connected, informed, and in control through a secure digital experience built around real progress and next steps.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button as={Link} to="/signup" size="lg">
                    Get started <ArrowRight size={18} />
                  </Button>
                  <Button as={Link} to="/signin" variant="secondary" size="lg">
                    Sign in
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="relative overflow-hidden rounded-[28px] border border-brand-border bg-gradient-to-br from-[#faf1f1] via-white to-[#f3f3f3] p-6 shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(154,28,32,0.12),transparent_38%)]" />
                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-sm">
                      <Logo className="mx-auto max-w-[230px]" />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-brand-border bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-grey">Claims</p>
                        <p className="mt-2 text-3xl font-semibold text-brand-black">24/7</p>
                        <p className="mt-1 text-sm text-brand-grey">Workflow visibility</p>
                      </div>
                      <div className="rounded-xl border border-brand-border bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-grey">Support</p>
                        <p className="mt-2 text-3xl font-semibold text-brand-black">Clear</p>
                        <p className="mt-1 text-sm text-brand-grey">Next steps</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="about" className="mt-14 scroll-mt-6 rounded-[28px] border border-brand-border bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-red">About us</p>
                <h2 className="mt-3 text-3xl font-light tracking-[0.01em] sm:text-4xl">Built around transparency, service, and trust.</h2>
                <p className="mt-4 text-[16px] leading-7 text-brand-grey">
                  Royal Square Financial is an independent South African financial brokerage focused on helping clients and advisers work more efficiently. We simplify the admin around claims, policy servicing, document collection, and review processes, so everyone knows what is happening, what happens next, and who is responsible.
                </p>
                <p className="mt-4 text-[16px] leading-7 text-brand-grey">
                  Our digital experience brings together advisory support, broader financial administration, and client communication into one connected environment.
                </p>
              </div>

              <div className="rounded-2xl border border-brand-border bg-brand-light-grey p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-white p-2 text-brand-red"><ShieldCheck size={18} /></div>
                    <div>
                      <p className="font-semibold">Client-first service</p>
                      <p className="text-sm text-brand-grey">We keep communication simple, timely, and transparent.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-white p-2 text-brand-red"><TrendingUp size={18} /></div>
                    <div>
                      <p className="font-semibold">Operational clarity</p>
                      <p className="text-sm text-brand-grey">Every workflow is mapped to ownership and next actions.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-white p-2 text-brand-red"><BriefcaseBusiness size={18} /></div>
                    <div>
                      <p className="font-semibold">Adviser support</p>
                      <p className="text-sm text-brand-grey">We reduce admin friction so advisers can focus on guidance and outcomes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="why-us" className="mt-14 scroll-mt-6">
            <div className="mb-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-red">Why choose us</p>
              <h2 className="mt-3 text-3xl font-light tracking-[0.01em] sm:text-4xl">A better way to stay on top of what matters.</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {reasons.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1">
                  <div className="inline-flex rounded-xl bg-[#f8ecec] p-3 text-brand-red">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-4 text-xl font-medium">{title}</h3>
                  <p className="mt-2 text-[15px] leading-6 text-brand-grey">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="partners" className="mt-14 scroll-mt-6 rounded-[24px] border border-brand-border bg-white px-4 py-10 shadow-sm sm:px-10 sm:py-12">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-[#152f66] sm:text-4xl">Our trusted partners</h2>
            <div className="mt-9 flex items-center gap-3 sm:gap-5">
              <button
                type="button"
                aria-label="Show previous partners"
                onClick={() => setPartnerOffset((current) => (current - 1 + partners.length) % partners.length)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-brand-red transition-colors hover:bg-[#f8ecec]"
              >
                <ChevronLeft size={29} />
              </button>

              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex transition-opacity duration-300">
                  {orderedPartners.map(({ name, className }) => (
                    <div key={name} className="flex min-w-full items-center justify-center px-3 sm:min-w-[33.333%] lg:min-w-[14.285%]">
                      <span className={`whitespace-nowrap text-2xl sm:text-3xl ${className}`}>{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                aria-label="Show next partners"
                onClick={() => setPartnerOffset((current) => (current + 1) % partners.length)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-brand-red transition-colors hover:bg-[#f8ecec]"
              >
                <ChevronRight size={29} />
              </button>
            </div>
          </section>
=======
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10 sm:px-10">
        <header className="flex items-center justify-between">
          <Logo className="max-w-[150px]" />
          <div className="flex items-end gap-5">
            <LanguageSelect id="landing-language" className="w-36" />
            {IS_SUPABASE_CONFIGURED && (
              <Link to="/login" className="pb-2.5 text-[15px] font-semibold text-brand-red hover:underline">
                {t('login.title')}
              </Link>
            )}
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center py-14">
          <h1 className="max-w-3xl text-[34px] font-light leading-[1.15] tracking-[0.005em] sm:text-[48px]">
            {t('landing.headline')}
          </h1>
          <p className="mt-5 max-w-xl text-[17px] text-[#4A4A4A]">
            {t('landing.sub')}
          </p>

          <div className="mt-10 max-w-3xl">
            <p className="mb-2 text-[13px] text-brand-grey">{t('landing.sample')}</p>
            <WorkflowOwner workflow={sampleClaim()} providerName="Santam" viewerRole="client" />
          </div>

          <div className="mt-12 grid max-w-3xl gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => enter('client')} className="group flex items-start gap-4 rounded-md border border-brand-border p-5 text-left transition-colors hover:border-brand-red">
              <UserRound className="mt-0.5 text-brand-red" size={22} aria-hidden="true" />
              <span>
                <span className="block font-display text-lg font-medium">{t('landing.openClient')}</span>
                <span className="block text-[14px] text-brand-grey">{t('landing.openClientHint')}</span>
              </span>
            </button>
            <button type="button" onClick={() => enter('adviser')} className="group flex items-start gap-4 rounded-md border border-brand-border p-5 text-left transition-colors hover:border-brand-red">
              <Briefcase className="mt-0.5 text-brand-red" size={22} aria-hidden="true" />
              <span>
                <span className="block font-display text-lg font-medium">{t('landing.openAdviser')}</span>
                <span className="block text-[14px] text-brand-grey">{t('landing.openAdviserHint')}</span>
              </span>
            </button>
          </div>
          <p className="mt-4 text-[13px] text-brand-grey">{t('landing.demoNote')}</p>
>>>>>>> 74250a30eb6f14e14093a76f53ab1a52636b5cc0
        </main>

        <footer id="contact" className="mt-14 scroll-mt-6 rounded-t-[28px] border-t border-brand-border bg-[#0c0c0c] px-6 py-8 text-white sm:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="inline-block overflow-hidden rounded-xl bg-white p-3 shadow-sm">
                <Logo className="block max-w-[180px]" />
              </div>
              <p className="mt-4 max-w-xs text-sm text-white/80">
                Royal Square Financial helps clients and advisers navigate change with clarity, confidence, and better visibility.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Contact</p>
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                <li className="flex items-center gap-2"><Mail size={16} className="text-brand-red" /> hello@royalsquarefinancial.co.za</li>
                <li className="flex items-center gap-2"><Phone size={16} className="text-brand-red" /> +27 11 000 0000</li>
                <li className="flex items-center gap-2"><MapPin size={16} className="text-brand-red" /> Johannesburg, South Africa</li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Office hours</p>
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                <li className="flex items-center gap-2"><Clock3 size={16} className="text-brand-red" /> Mon - Fri: 8:00 - 17:00</li>
                <li className="flex items-center gap-2"><Clock3 size={16} className="text-brand-red" /> Sat - Sun: By appointment</li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
