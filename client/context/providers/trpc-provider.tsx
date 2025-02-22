import { QueryClientProvider } from '@tanstack/react-query'
import { httpLink, loggerLink } from '@trpc/client'
import consola from 'consola'
import * as React from 'react'
import { isDevelopment } from 'std-env'
import superjson from 'superjson'
import { queryClient, trpc } from '#/services/trpc-client'

export default function TRPCProvider({ children }: React.PropsWithChildren) {
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        httpLink({
          url: '/trpc',
          transformer: superjson,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'same-origin',
              headers: { ...options?.headers },
            })
          },
        }),
        loggerLink({
          console: {
            log: (args) => consola.withTag('trpcProvider').log(args),
            error: (args) => consola.withTag('trpcProvider').error(args),
          },
          enabled: (opts) => {
            return isDevelopment || (opts.direction === 'down' && opts.result instanceof Error)
          },
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
