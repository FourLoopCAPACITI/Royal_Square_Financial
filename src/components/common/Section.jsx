export default function Section({ title, count, action, children, className = '' }) {
  return (
    <section className={`mb-10 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-brand-border pb-2">
          <h2 className="text-lg font-medium">
            {title}
            {typeof count === 'number' && <span className="ml-2 text-base font-normal text-brand-grey">{count}</span>}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
