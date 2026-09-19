import { Outlet, useLocation } from 'react-router-dom';
import { LogOut, WifiOff } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import MobileNav from './MobileNav.jsx';
import DemoBar from './DemoBar.jsx';
import SyncNotice from './SyncNotice.jsx';
import ChatWidget from '../chat/ChatWidget.jsx';
import { navFor } from '../../config/navigation.js';
import { useSession } from '../../context/SessionContext.jsx';
import { useConnectivity } from '../../context/ConnectivityContext.jsx';

function AccountFooter() {
  const { role, isDemo, isAuthenticated, profile, signOut } = useSession();
  return (
    <div className="text-[13px]">
      <p className="font-semibold">{isDemo ? (role === 'adviser' ? 'Sipho Ndlovu' : 'Lerato Molefe') : profile?.full_name || 'Signed in'}</p>
      <p className="text-brand-grey">{role === 'adviser' ? 'Adviser' : role === 'admin' ? 'Administrator' : 'Client'}{isDemo ? ' (demo)' : ''}</p>
      {isAuthenticated && (
        <button type="button" onClick={signOut} className="mt-2 inline-flex items-center gap-1.5 text-brand-grey hover:text-brand-red">
          <LogOut size={14} aria-hidden="true" /> Sign out
        </button>
      )}
    </div>
  );
}

export default function AppShell() {
  const { role, demoModeEnabled } = useSession();
  const { online } = useConnectivity();
  const location = useLocation();
  const items = navFor(role);
  const onChatPage = location.pathname.endsWith('/chat');

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar items={items} footer={<AccountFooter />} />
      <div className="flex min-w-0 flex-1 flex-col">
        {demoModeEnabled && <DemoBar />}
        <MobileNav items={items} footer={<AccountFooter />} />
        {!online && (
          <div className="border-b border-warn/20 bg-warn-tint px-4 py-2.5 text-[14px] text-warn lg:px-8" role="status">
            <span className="inline-flex items-center gap-2 font-semibold">
              <WifiOff size={16} aria-hidden="true" /> Offline mode
            </span>{' '}
            Anything you capture is saved on this device and synced when connectivity returns.
          </div>
        )}
        <SyncNotice />
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-8 sm:px-6 lg:px-10 lg:pb-16">
          <Outlet />
        </main>
      </div>
      {!onChatPage && <ChatWidget />}
    </div>
  );
}
