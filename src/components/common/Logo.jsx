/** The supplied Royal Square Financial logo — never redrawn or stretched. */
export default function Logo({ variant = 'full', className = '' }) {
  if (variant === 'mark') {
    return <img src="/royal-square-mark.png" alt="Royal Square Financial" className={`h-9 w-9 object-contain ${className}`} />;
  }
  return <img src="/royal-square-logo-trimmed.jpg" alt="Royal Square Financial" className={`h-auto w-full max-w-[180px] object-contain ${className}`} />;
}
