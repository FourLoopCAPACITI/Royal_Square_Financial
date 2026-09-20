import { useLocation } from 'react-router-dom';
import { useSession } from '../../context/SessionContext.jsx';
import AccidentButton from '../claims/AccidentButton.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import NotificationBell from '../notifications/NotificationBell.jsx';

export default function AppToolbar() {
  const { role, loading } = useSession();
  const onLanding = useLocation().pathname === '/';
  return (
    <ThemeToggle hidden={onLanding}>
      {!loading && role === 'client' && <AccidentButton compact />}
      <NotificationBell />
    </ThemeToggle>
  );
}
