import { tv } from 'tailwind-variants'

export const installerStyles = tv({
  slots: {
    main: 'min-h-screen bg-background text-foreground',
    container: 'mx-auto max-w-xl px-4 py-12',
    header: 'mb-8 text-center',
    logo: 'mx-auto mb-4 size-20',
    title: 'font-bold text-2xl text-foreground',
    subtitle: 'mt-2 text-muted-foreground',
    errorContainer: '-mb-4 mt-6',
    errorBox: 'rounded-[0.3rem] bg-error p-4 text-error-foreground',
    errorIcon: 'size-5 text-error',
    errorMessage: 'font-medium text-error-foreground text-sm',
    card: 'rounded-[0.3rem] bg-card p-8 text-card-foreground shadow',
    sectionTitle: 'font-bold text-foreground text-lg',
    inputLabel: 'block font-medium text-foreground text-sm',
    input:
      'mt-0.5 block w-full rounded-[0.3rem] border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring',
    validationMessage: 'validation-message mt-1 text-error text-sm',
    helpText: 'mt-1 px-0.5 text-muted-foreground text-sm',
    divider: 'space-y-3 border-border border-t pt-4',
    checkbox:
      'size-4 rounded-[0.3rem] border-border text-primary focus:border-ring focus:ring-ring',
    button:
      'w-full rounded-[0.3rem] bg-primary px-4 py-2 text-primary-foreground focus:outline-none focus:ring-2 hover:enabled:brightness-90 disabled:cursor-not-allowed disabled:opacity-50',
    footer: 'mt-8 text-center text-muted-foreground text-sm',
    link: 'inline-flex items-center text-primary hover:underline',
    linkIcon: 'ml-0.5 size-3.5',
    formGrid: 'grid grid-cols-2 gap-4',
    formSection: 'space-y-3',
    passwordContainer: 'relative',
    passwordButton:
      'absolute inset-y-0 right-0 mt-0.5 flex cursor-pointer items-center px-3 text-muted-foreground',
    checkboxContainer: 'flex items-start py-1',
    checkboxWrapper: 'mt-1.5 flex h-5 items-center',
    checkboxLabel: 'ml-2',
    buttonWrapper: 'pt-1',
  },
})
