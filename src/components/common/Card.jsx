/** Bordered panel. Use `as` to render a link or button. */
export default function Card({ as: Component = 'div', className = '', padded = true, children, ...props }) {
  return (
    <Component className={`rounded-md border border-brand-border bg-white ${padded ? 'p-5' : ''} ${className}`} {...props}>
      {children}
    </Component>
  );
}
