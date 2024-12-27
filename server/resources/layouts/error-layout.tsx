import BaseLayout from './base-layout'

interface ErrorLayoutProps {
  children: React.ReactNode
  csrfToken: string
  title: string
}

export default function ErrorLayout({ children, csrfToken, title }: ErrorLayoutProps) {
  return (
    <BaseLayout title={title} csrfToken={csrfToken}>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
        {children}
      </div>
    </BaseLayout>
  )
}
