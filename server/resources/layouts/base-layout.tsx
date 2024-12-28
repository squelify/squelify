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
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <script src="https://cdn.tailwindcss.com" />
        <script src="/installer.js" defer />
        <title>{title}</title>
      </head>
      <body className="h-full bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        {children}
      </body>
    </html>
  )
}
