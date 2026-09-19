import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import Button from './Button.jsx';

export function LoadingState({ label = 'Loading' }) {
  return (
    <div className="flex items-center gap-3 py-10 text-brand-grey" role="status">
      <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-md border border-dashed border-brand-border px-5 py-8">
      <Icon size={22} className="text-brand-grey" aria-hidden="true" />
      <p className="font-semibold">{title}</p>
      {message && <p className="max-w-prose text-brand-grey">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-md border border-brand-red/30 bg-brand-red-tint px-5 py-6" role="alert">
      <div className="flex items-center gap-2 font-semibold text-brand-red">
        <AlertCircle size={18} aria-hidden="true" /> This section didn't load
      </div>
      <p className="text-sm text-text-secondary">{String(error?.message || error || 'Unknown error')}. Check your connection or Supabase settings, then try again.</p>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Render loading / error / content with one component. */
export function QueryState({ query, loadingLabel, children }) {
  if (query.loading) return <LoadingState label={loadingLabel} />;
  if (query.error) return <ErrorState error={query.error} onRetry={query.reload} />;
  return children(query.data);
}
