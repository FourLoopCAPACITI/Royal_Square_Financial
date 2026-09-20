export default function PageHeader({ title, description, actions }) {
  return (
    <header className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[32px] font-semibold leading-tight sm:text-[40px]">{title}</h1>
        <span className="mt-3 block h-[3px] w-12 rounded-full bg-gold" aria-hidden="true" />
        {description && <p className="mt-2 max-w-2xl text-brand-grey">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
