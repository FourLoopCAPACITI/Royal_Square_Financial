export default function PageHeader({ title, description, actions }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[28px] font-normal leading-tight tracking-[0.01em] sm:text-[32px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-brand-grey">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
