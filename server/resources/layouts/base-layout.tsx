interface BaseLayoutProps {
  children: React.ReactNode
  csrfToken: string
  title: string
}

export default function BaseLayout({ children, csrfToken, title }: BaseLayoutProps) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="csrf-token" content={csrfToken} />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <script src="https://cdn.tailwindcss.com" />
        <title>{title}</title>
      </head>
      <body className="h-full bg-white text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  )
}
