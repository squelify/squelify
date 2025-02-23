import { Suspense } from 'react'
import PageLoader from '#/components/loaders/page-loader'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  title?: string
}

export default function PageWrapper({ children, className, title }: PageWrapperProps) {
  return (
    <>
      <title>{`${title} - Squelfy` || 'Squelify'}</title>
      <Suspense fallback={<PageLoader />}>
        <div className={className}>{children}</div>
      </Suspense>
    </>
  )
}
