import { useSession } from '../../context/SessionContext.jsx';
import AccidentButton from '../claims/AccidentButton.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import NotificationBell from '../notifications/NotificationBell.jsx';

export default function AppToolbar() {
  const { role, loading } = useSession();
  return (
    <ThemeToggle>
      {!loading && role === 'client' && <AccidentButton compact />}
      <NotificationBell />
    </ThemeToggle>
  );
}
