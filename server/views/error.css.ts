import { tv } from 'tailwind-variants'

export const errorStyles = tv({
  slots: {
    wrapper: 'relative min-h-screen overflow-hidden bg-white dark:bg-gray-950',
    decorativeGradient: 'absolute inset-0 overflow-hidden',
    gradientInner: '-inset-[10px] absolute opacity-50',
    gradientBg: [
      'absolute top-0 h-[40rem] w-full',
      'bg-gradient-to-b from-gray-200 via-transparent to-transparent dark:from-gray-800 dark:via-transparent dark:to-transparent',
      'before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] before:from-gray-300/20 before:via-transparent before:to-transparent dark:before:from-gray-700/20',
      'after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] after:from-blue-300/20 after:via-transparent after:to-transparent dark:after:from-blue-700/20',
    ],
    content:
      'relative flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8',
    container: 'relative z-20 text-center',
    errorCode: 'font-bold text-2xl text-red-600 dark:text-red-500',
    title: 'mt-4 font-bold text-3xl text-gray-900 tracking-tight sm:text-5xl dark:text-white',
    description: 'mt-6 text-base text-gray-700 leading-7 dark:text-gray-300',
    actions: 'mt-10 flex items-center justify-center gap-x-4',
    primaryButton: [
      'min-w-[140px] cursor-pointer rounded-lg bg-gray-900 px-4 py-2.5 font-semibold text-sm text-white',
      'transition-all duration-200 hover:bg-gray-800 hover:shadow-gray-400/20 hover:shadow-lg',
      'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
      'focus:ring-offset-white dark:focus:ring-offset-gray-950',
      'border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700',
    ],
    secondaryButton: [
      'min-w-[140px] rounded-lg border border-gray-300 bg-white/90 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800/90',
      'cursor-pointer font-semibold text-gray-700 text-sm dark:text-gray-200',
      'transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700',
      'hover:text-gray-900 hover:shadow-gray-400/10 hover:shadow-lg dark:hover:text-white',
      'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
      'focus:ring-offset-white dark:focus:ring-offset-gray-950',
    ],
    decorativeCode:
      'pointer-events-none fixed inset-0 z-10 flex select-none items-center justify-center',
    decorativeText:
      'font-black text-[12rem] text-red-200/30 mix-blend-overlay sm:text-[16rem] md:text-[20rem] dark:text-red-950/20',
  },
})
