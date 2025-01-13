import React, { Suspense } from 'react'
import PageLoader from '#/components/loaders/page-loader'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export default function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <Suspense fallback={<PageLoader />}>
      <div className={className}>{children}</div>
    </Suspense>
  )
}
