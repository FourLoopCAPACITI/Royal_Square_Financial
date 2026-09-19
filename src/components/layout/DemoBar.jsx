/**
 * DEMO FUNCTIONALITY — hackathon only. Remove before launch.
 * Switch Client/Adviser view, simulate offline, reset demo data.
 */
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Wifi, WifiOff } from 'lucide-react';
import { useSession } from '../../context/SessionContext.jsx';
import { useConnectivity } from '../../context/ConnectivityContext.jsx';
import { resetDemoState } from '../../services/store.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function DemoBar() {
  const { t } = useI18n();
  const { isDemo, role, setDemoRole } = useSession();
  const { online, setDemoOffline, pendingCount } = useConnectivity();
  const navigate = useNavigate();

  const switchTo = (next) => {
    setDemoRole(next);
    navigate(next === 'adviser' ? '/adviser' : '/client');
  };

  return (
    <div className="bg-brand-black text-white">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-[13px] lg:px-8">
        <span className="rounded-sm border border-white/40 px-1.5 py-px text-[11px] font-semibold">{t('demo.mode')}</span>

        {isDemo && (
          <div className="flex overflow-hidden rounded border border-white/25" role="group" aria-label={t('demo.switchView')}>
            {[
              ['client', t('demo.clientView')],
              ['adviser', t('demo.adviserView')],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => switchTo(value)}
                aria-pressed={role === value}
                className={`px-3 py-1 ${role === value ? 'bg-brand-red font-semibold' : 'hover:bg-white/10'}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setDemoOffline(online)}
          aria-pressed={!online}
          className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 ${online ? 'border-white/25 hover:bg-white/10' : 'border-[#E8B04B] text-[#F3CF8A]'}`}
        >
          {online ? <Wifi size={14} aria-hidden="true" /> : <WifiOff size={14} aria-hidden="true" />}
          {online ? t('demo.online') : t('demo.offline')}
          {pendingCount > 0 && <span className="ml-1 rounded-sm bg-white/15 px-1">{t('demo.waitingToSync', { count: pendingCount })}</span>}
        </button>

        <button
          type="button"
          onClick={() => {
            if (window.confirm(t('demo.resetConfirm'))) resetDemoState();
          }}
          className="ml-auto inline-flex items-center gap-1.5 text-white/70 hover:text-white"
        >
          <RotateCcw size={14} aria-hidden="true" /> {t('demo.reset')}
        </button>
      </div>
    </div>
  );
}
