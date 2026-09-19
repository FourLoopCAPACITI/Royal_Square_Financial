import { Link } from 'react-router-dom';
import { CheckCircle2, X } from 'lucide-react';
import { useConnectivity } from '../../context/ConnectivityContext.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

/** Shown after offline accident reports were uploaded. */
export default function SyncNotice() {
  const { t } = useI18n();
  const { lastSync, clearLastSync } = useConnectivity();
  const synced = lastSync?.results?.filter((r) => r.ok) || [];
  if (!synced.length) return null;
  return (
    <div className="border-b border-ok/20 bg-ok-tint px-4 py-3 lg:px-8" role="status">
      <div className="flex items-start gap-3 text-[14px] text-ok">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p className="flex-1">
          {t('sync.backOnline', { count: synced.length })}{' '}
          <Link className="font-semibold underline" to={`/workflow/${synced[0].workflowId}`}>
            {t('sync.trackClaim')}
          </Link>
        </p>
        <button type="button" onClick={clearLastSync} aria-label={t('common.dismiss')} className="rounded p-0.5 hover:bg-ok/10">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
