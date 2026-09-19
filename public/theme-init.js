// Apply the saved preference before the app paints to avoid a light-mode flash.
(() => {
  let saved;
  try { saved = localStorage.getItem('rsf-theme'); } catch { /* Storage may be disabled. */ }
  const dark = saved === 'dark' || (saved !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
})();
