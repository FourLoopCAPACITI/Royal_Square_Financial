import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../../context/SessionContext.jsx';
import { LoadingState } from '../common/States.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export function homeFor(role) {
  return role === 'adviser' || role === 'admin' ? '/adviser' : '/client';
}

/**
 * Role-based route guard.
 * allow: roles that may view the nested routes. Admins can view adviser routes.
 * In demo mode the role comes from the Client/Adviser switch.
 */
export default function ProtectedRoute({ allow }) {
  const { role, loading } = useSession();
  const { t } = useI18n();
  if (loading) {
    return (
      <div className="px-8">
        <LoadingState label={t('shell.checkingSession')} />
      </div>
    );
  }
  if (!role) return <Navigate to="/login" replace />;
  if (allow && !allow.includes(role)) return <Navigate to={homeFor(role)} replace />;
  return <Outlet />;
}
