/** The supplied Royal Square Financial logo — never redrawn or stretched. */
export default function Logo({ variant = 'full', className = '' }) {
  if (variant === 'mark') {
    return <img src="/royal-square-mark.png" alt="Royal Square Financial" className={`h-9 w-auto object-contain ${className}`} />;
  }
  // Transparent artwork: navy lettering needs an ivory chip on the dark theme.
  const size = className.includes('max-w-') ? '' : 'max-w-[220px]';
  return <img src="/royal-square-logo.png" alt="Royal Square Financial" className={`h-auto w-full object-contain dark:rounded-md dark:bg-[#FDFBF6] dark:p-1.5 ${size} ${className}`} />;
}
