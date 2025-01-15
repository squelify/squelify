import { QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import * as React from 'react'
import { isDevelopment } from 'std-env'
import superjson from 'superjson'
import { queryClient, trpc } from '#/services/trpc-client'

export default function TRPCProvider({ children }: React.PropsWithChildren) {
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/trpc',
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include',
              headers: {
                ...options?.headers,
                'Content-Type': 'application/json',
              },
            })
          },
          transformer: superjson,
        }),
        loggerLink({
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
