export default function ProgressBar({ value = 0, tone = 'red', label, className = '' }) {
  const colour = tone === 'green' ? 'bg-ok' : tone === 'dark' ? 'bg-brand-black' : 'bg-brand-red';
  return (
    <div className={className}>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-brand-light-grey"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div className={`h-full rounded-full ${colour} transition-[width] duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
