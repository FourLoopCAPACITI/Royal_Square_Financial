/**
 * DEMO FUNCTIONALITY — hackathon only. Remove before launch.
 * Switch Client/Adviser view, simulate offline, reset demo data.
 */
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Wifi, WifiOff } from 'lucide-react';
import { useSession } from '../../context/SessionContext.jsx';
import { useConnectivity } from '../../context/ConnectivityContext.jsx';
import { resetDemoState } from '../../services/store.js';

export default function DemoBar() {
  const { isDemo, role, setDemoRole } = useSession();
  const { online, setDemoOffline, pendingCount } = useConnectivity();
  const navigate = useNavigate();

  const switchTo = (next) => {
    setDemoRole(next);
    navigate(next === 'adviser' ? '/adviser' : '/client');
  };

  return (
    <div className="bg-strong text-white">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-[13px] lg:px-8">
        <span className="rounded-sm border border-white/40 px-1.5 py-px text-[11px] font-semibold">Demo mode</span>

        {isDemo && (
          <div className="flex overflow-hidden rounded border border-white/25" role="group" aria-label="Switch view">
            {[
              ['client', 'Client view'],
              ['adviser', 'Adviser view'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => switchTo(value)}
                aria-pressed={role === value}
                className={`px-3 py-1 ${role === value ? 'bg-action font-semibold' : 'hover:bg-white/10'}`}
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
          {online ? 'Online' : 'Offline'}
          {pendingCount > 0 && <span className="ml-1 rounded-sm bg-white/15 px-1">{pendingCount} waiting to sync</span>}
        </button>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all demo data to the starting state?')) resetDemoState();
          }}
          className="ml-auto inline-flex items-center gap-1.5 text-white/70 hover:text-white"
        >
          <RotateCcw size={14} aria-hidden="true" /> Reset demo data
        </button>
      </div>
    </div>
  );
}
