import { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Building2, ChevronLeft, ChevronRight, Clock3, Mail, MapPin, Phone, ShieldCheck, TrendingUp } from 'lucide-react';
import Logo from '../components/common/Logo.jsx';
import Button from '../components/common/Button.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { homeFor } from '../components/layout/ProtectedRoute.jsx';
import LanguageSelect from '../components/common/LanguageSelect.jsx';
import WorkflowOwner from '../components/workflows/WorkflowOwner.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { createWorkflow, advanceWorkflow } from '../utils/workflow.js';

function sampleClaim() {
  let { workflow } = createWorkflow('motor_claim', { clientId: 'sample', providerId: 'p1' });
  for (let i = 0; i < 2; i += 1) workflow = advanceWorkflow(workflow).workflow;
  return workflow;
}

// All visible text goes through t('landing.*') — add keys to src/i18n/locales/{en,af,zu}.js, never hardcode strings.
const reasons = [
  {
    icon: ShieldCheck,
    key: 'landing.why.1',
  },
  {
    icon: TrendingUp,
    key: 'landing.why.2',
  },
  {
    icon: BriefcaseBusiness,
    key: 'landing.why.3',
  },
  {
    icon: Building2,
    key: 'landing.why.4',
  },
];

const partners = [
  { name: 'Sanlam', className: 'font-display font-semibold tracking-tight' },
  { name: 'Old Mutual', className: 'font-display font-semibold tracking-tight' },
  { name: 'Liberty', className: 'font-semibold italic tracking-tight' },
  { name: 'Momentum', className: 'font-display font-semibold tracking-tight' },
  { name: 'Discovery', className: 'font-display font-semibold tracking-tight' },
  { name: 'Allan Gray', className: 'font-display font-semibold tracking-tight' },
  { name: 'Santam', className: 'font-display font-semibold tracking-tight' },
];

export default function Landing() {
  const { isAuthenticated, role, demoModeEnabled, setDemoRole } = useSession();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [partnerOffset, setPartnerOffset] = useState(0);
  const orderedPartners = partners.map((_, index) => partners[(index + partnerOffset) % partners.length]);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isAuthenticated && role) return <Navigate to={homeFor(role)} replace />;

  const enter = (next) => {
    setDemoRole(next);
    navigate(next === 'adviser' ? '/adviser' : '/client');
  };

  return (
    <div className="min-h-screen bg-brand-light-grey text-brand-black">
      <header className={`sticky top-0 z-40 border-b-2 border-gold/60 backdrop-blur transition-[background-color,box-shadow] duration-200 ${scrolled ? 'bg-surface/90 shadow-md' : 'bg-surface'}`}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
          <Logo className="max-w-[210px]" />

          <nav className="order-3 flex w-full items-center justify-center gap-6 overflow-x-auto border-t border-brand-border pt-3 text-[15px] font-semibold text-brand-black sm:order-none sm:w-auto sm:border-0 sm:pt-0 lg:gap-9" aria-label={t('landing.nav.label')}>
            <a href="#about" className="whitespace-nowrap border-b-2 border-transparent py-1 transition-colors hover:border-gold">{t('landing.nav.about')}</a>
            <a href="#why-us" className="whitespace-nowrap border-b-2 border-transparent py-1 transition-colors hover:border-gold">{t('landing.nav.why')}</a>
            <a href="#partners" className="whitespace-nowrap border-b-2 border-transparent py-1 transition-colors hover:border-gold">{t('landing.nav.partners')}</a>
            <a href="#contact" className="whitespace-nowrap border-b-2 border-transparent py-1 transition-colors hover:border-gold">{t('landing.nav.contact')}</a>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSelect id="landing-language" className="w-32" />
            <Button as={Link} to="/signin" variant="secondary" size="sm">
              {t('landing.signIn')}
            </Button>
            <Button as={Link} to="/signup" size="sm">
              {t('landing.signUp')}
            </Button>
          </div>
        </div>
      </header>

      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:py-20 lg:px-8">
          <div>
            <p className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.28em] text-gold">
              <span className="h-px w-10 bg-gold" aria-hidden="true" />
              {t('landing.hero.eyebrow')}
            </p>
            <h1 className="mt-5 max-w-2xl text-[42px] font-semibold leading-[1.08] !text-white sm:text-6xl">
              {t('landing.hero.title')}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
              {t('landing.hero.body')}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/signup" variant="gold" size="lg">
                {t('landing.getStarted')} <ArrowRight size={18} />
              </Button>
              <Button as={Link} to="/signin" variant="secondary" size="lg" className="!border-white/40 !bg-transparent !text-white hover:!border-gold hover:!bg-white/5">
                {t('landing.signIn')}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-gold/40 bg-[#FDFBF6] p-5 text-navy shadow-[0_18px_40px_rgba(0,0,0,0.25)] sm:p-6">
            <Logo className="mx-auto max-w-[300px] !bg-transparent" />
            <span className="my-5 block h-px w-full bg-gold/60" aria-hidden="true" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-[#E4DCC6] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5C6473]">{t('landing.stat.claims')}</p>
                <p className="mt-2 font-display text-4xl font-semibold text-navy">{t('landing.stat.claimsValue')}</p>
                <p className="mt-1 text-sm text-[#5C6473]">{t('landing.stat.claimsNote')}</p>
              </div>
              <div className="rounded-md border border-[#E4DCC6] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5C6473]">{t('landing.stat.support')}</p>
                <p className="mt-2 font-display text-4xl font-semibold text-navy">{t('landing.stat.supportValue')}</p>
                <p className="mt-1 text-sm text-[#5C6473]">{t('landing.stat.supportNote')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <main className="mt-12">
          {demoModeEnabled && (
            <section className="mt-8 rounded-lg border border-brand-border bg-surface p-6 shadow-card">
              <p className="mb-3 text-sm text-brand-grey">{t('landing.sample')}</p>
              <WorkflowOwner workflow={sampleClaim()} providerName="Santam" viewerRole="client" />
              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={() => enter('client')}>{t('landing.openClient')}</Button>
                <Button variant="secondary" onClick={() => enter('adviser')}>{t('landing.openAdviser')}</Button>
              </div>
              <p className="mt-3 text-sm text-brand-grey">{t('landing.demoNote')}</p>
            </section>
          )}

          <section id="about" className="mt-14 scroll-mt-32 sm:scroll-mt-24 rounded-lg border border-brand-border bg-surface p-6 shadow-card sm:p-10">
            <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-gold-deep">{t('landing.about.eyebrow')}</p>
                <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">{t('landing.about.title')}</h2>
                <p className="mt-4 text-[16px] leading-7 text-brand-grey">
                  {t('landing.about.p1')}
                </p>
                <p className="mt-4 text-[16px] leading-7 text-brand-grey">
                  {t('landing.about.p2')}
                </p>
              </div>

              <div className="rounded-lg border border-brand-border bg-brand-light-grey p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-navy p-2 text-gold"><ShieldCheck size={18} /></div>
                    <div>
                      <p className="font-semibold">{t('landing.about.a.title')}</p>
                      <p className="text-sm text-brand-grey">{t('landing.about.a.body')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-navy p-2 text-gold"><TrendingUp size={18} /></div>
                    <div>
                      <p className="font-semibold">{t('landing.about.b.title')}</p>
                      <p className="text-sm text-brand-grey">{t('landing.about.b.body')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-navy p-2 text-gold"><BriefcaseBusiness size={18} /></div>
                    <div>
                      <p className="font-semibold">{t('landing.about.c.title')}</p>
                      <p className="text-sm text-brand-grey">{t('landing.about.c.body')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="why-us" className="mt-14 scroll-mt-32 sm:scroll-mt-24">
            <div className="mb-6 text-center">
              <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-gold-deep">{t('landing.why.eyebrow')}</p>
              <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">{t('landing.why.title')}</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {reasons.map(({ icon: Icon, key }) => (
                <div key={key} className="rounded-lg border border-brand-border border-t-[3px] border-t-gold bg-surface p-6 shadow-card transition-shadow duration-200 hover:shadow-md">
                  <div className="inline-flex rounded-md bg-navy p-3 text-gold">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold">{t(`${key}.title`)}</h3>
                  <p className="mt-2 text-[16.5px] leading-6 text-brand-grey">{t(`${key}.body`)}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="partners" className="mt-14 scroll-mt-32 sm:scroll-mt-24 rounded-lg border border-brand-border bg-surface px-4 py-10 shadow-card sm:px-10 sm:py-12">
            <h2 className="text-center text-3xl font-display font-semibold tracking-tight text-brand-black sm:text-4xl">{t('landing.partners.title')}</h2>
            <div className="mt-9 flex items-center gap-3 sm:gap-5">
              <button
                type="button"
                aria-label={t('landing.partners.prev')}
                onClick={() => setPartnerOffset((current) => (current - 1 + partners.length) % partners.length)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-brand-red transition-colors hover:bg-brand-red-tint"
              >
                <ChevronLeft size={29} />
              </button>

              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex transition-opacity duration-300">
                  {orderedPartners.map(({ name, className }) => (
                    <div key={name} className="flex min-w-full items-center justify-center px-3 sm:min-w-[33.333%] lg:min-w-[14.285%]">
                      <span className={`whitespace-nowrap text-2xl text-brand-grey sm:text-3xl ${className}`}>{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                aria-label={t('landing.partners.next')}
                onClick={() => setPartnerOffset((current) => (current + 1) % partners.length)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-brand-red transition-colors hover:bg-brand-red-tint"
              >
                <ChevronRight size={29} />
              </button>
            </div>
          </section>

          <section className="mt-14 rounded-lg border border-brand-border bg-surface p-6 shadow-card sm:p-10" aria-labelledby="ceo-title">
            <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-gold-deep">Leadership</p>
            <h2 id="ceo-title" className="mt-3 text-4xl font-semibold sm:text-5xl">Meet the CEO</h2>

            <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-6">
              <img
                src="/rsf_ceo_headshot.jpg"
                alt="Qiniso Ntuli, CEO of Royal Square Financial."
                className="h-48 w-48 shrink-0 rounded-lg border border-brand-border object-cover object-top shadow-sm"
              />

              <div>
                <h3 className="font-display text-2xl font-semibold text-brand-black">Qiniso Ntuli</h3>
                <p className="mt-1 font-display text-lg text-brand-grey">Chief Executive Officer, Royal Square Financial</p>
                <p className="mt-5 text-[16.5px] leading-7 text-brand-black">
                  With over 17 years of experience at Royal Square Financial, currently serving as Chief Executive Officer, I contribute to the organization's strategic planning and leadership initiatives. I collaborate with teams to drive sustainable growth, deliver tailored financial solutions, and foster innovation. Proficient in utilizing tools like Microsoft Office, I focus on operational efficiency to align with the company's vision of empowering clients to achieve financial success. Passionate about creating impactful strategies, my goal is to support teams in navigating challenges and unlocking opportunities that deliver value for our stakeholders.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer id="contact" className="mt-14 scroll-mt-32 sm:scroll-mt-24 rounded-t-lg border-t-4 border-gold bg-navy-deep px-6 py-10 text-white sm:px-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="inline-block overflow-hidden rounded-md bg-[#FDFBF6] p-3">
                <Logo className="block max-w-[180px]" />
              </div>
              <p className="mt-4 max-w-xs text-sm text-white/80">
                {t('landing.footer.blurb')}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">{t('landing.footer.contact')}</p>
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                <li className="flex items-center gap-2"><Mail size={16} className="text-gold" /> hello@royalsquarefinancial.co.za</li>
                <li className="flex items-center gap-2"><Phone size={16} className="text-gold" /> +27 11 000 0000</li>
                <li className="flex items-center gap-2"><MapPin size={16} className="text-gold" /> Johannesburg, South Africa</li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">{t('landing.footer.hours')}</p>
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                <li className="flex items-center gap-2"><Clock3 size={16} className="text-gold" /> {t('landing.footer.weekdays')}</li>
                <li className="flex items-center gap-2"><Clock3 size={16} className="text-gold" /> {t('landing.footer.weekend')}</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-white/15 pt-6 text-center">
            <Link to="/roadmap" className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-gold">
              Next patch updates <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
