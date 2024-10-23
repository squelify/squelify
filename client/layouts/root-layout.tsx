import React from 'react'
import { Toaster } from 'sonner'
import { clx } from '../utils/helper'

interface RootLayoutProps {
  children: React.ReactNode
  className?: string
}

export default function RootLayout({ children, className }: RootLayoutProps) {
  return (
    <React.Fragment>
      <div className={clx(className)}>{children}</div>
      <Toaster richColors theme="system" />
    </React.Fragment>
  )
}
