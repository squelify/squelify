export const errorStyles = {
  wrapper: 'relative min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden',
  decorativeGradient: 'absolute inset-0 overflow-hidden',
  gradientInner: 'absolute -inset-[10px] opacity-50',
  gradientBg: [
    'absolute top-0 h-[40rem] w-full',
    'bg-gradient-to-b from-blue-500/20 via-transparent to-transparent dark:from-blue-900/30 dark:via-transparent dark:to-transparent',
    'before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] before:from-blue-400/10 dark:before:from-blue-500/10 before:via-transparent before:to-transparent',
    'after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] after:from-indigo-400/10 dark:after:from-indigo-500/10 after:via-transparent after:to-transparent',
  ].join(' '),
  content:
    'relative flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8',
  container: 'relative z-20 text-center',
  errorCode: 'text-2xl font-bold text-blue-500 dark:text-blue-400',
  title: 'mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl',
  description: 'mt-6 text-base leading-7 text-slate-600 dark:text-slate-400',
  actions: 'mt-10 flex items-center justify-center gap-x-4',
  primaryButton: [
    'min-w-[140px] rounded-lg bg-blue-500 px-4 py-2.5 text-sm cursor-pointer font-semibold text-white',
    'transition-all duration-200 hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-500/20',
    'focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2',
    'focus:ring-offset-slate-50 dark:focus:ring-offset-slate-950',
  ].join(' '),
  secondaryButton: [
    'min-w-[140px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-2.5',
    'text-sm cursor-pointer font-semibold text-slate-700 dark:text-slate-200',
    'transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-500/30',
    'hover:text-blue-500 dark:hover:text-blue-400 hover:shadow-lg hover:shadow-blue-500/10',
    'focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2',
    'focus:ring-offset-slate-50 dark:focus:ring-offset-slate-950',
  ].join(' '),
  decorative404:
    'fixed inset-0 flex items-center justify-center z-10 pointer-events-none select-none',
  decorative500:
    'fixed inset-0 flex items-center justify-center z-10 pointer-events-none select-none',
  decorativeText:
    'text-[12rem] sm:text-[16rem] md:text-[20rem] font-black text-blue-100/30 dark:text-blue-900/20 mix-blend-overlay',
} as const
