interface BaseLayoutProps {
  children: React.ReactNode
  csrfToken: string
  title: string
  cssLinks?: string[]
}

export default function BaseLayout({ children, csrfToken, title, cssLinks }: BaseLayoutProps) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="csrf-token" content={csrfToken} />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {cssLinks?.map((link) => (
          <link key={link} rel="stylesheet" href={`/${link}`} />
        ))}
        <script src="/installer.js" defer />
        <title>{title}</title>
      </head>
      <body>{children}</body>
    </html>
  )
}
