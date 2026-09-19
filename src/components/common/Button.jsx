const VARIANTS = {
  primary: 'bg-brand-red text-white hover:bg-brand-red-dark border border-brand-red',
  secondary: 'bg-white text-brand-black border border-brand-border hover:border-brand-black',
  ghost: 'bg-transparent text-brand-black border border-transparent hover:bg-brand-light-grey',
  dark: 'bg-brand-black text-white border border-brand-black hover:bg-[#262626]',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-[15px]',
  lg: 'px-5 py-3.5 text-base',
};

export default function Button({ as: Component = 'button', variant = 'primary', size = 'md', className = '', icon: Icon, children, ...props }) {
  const typeProps = Component === 'button' ? { type: props.type || 'button' } : {};
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...typeProps}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 15 : 18} aria-hidden="true" />}
      {children}
    </Component>
  );
}
