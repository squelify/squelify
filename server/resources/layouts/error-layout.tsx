import BaseLayout from './base-layout'

interface ErrorLayoutProps {
  children: React.ReactNode
  csrfToken: string
  title: string
}

export default function ErrorLayout({ children, csrfToken, title }: ErrorLayoutProps) {
  return (
    <BaseLayout title={title} csrfToken={csrfToken}>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-gray-100 p-4 dark:from-gray-950 dark:to-gray-900">
        {children}
      </div>
    </BaseLayout>
  )
}
