// FIXME: https://trpc.io/docs/migrate-from-v10-to-v11

import { type AnyRouter, TRPCError } from '@trpc/server'
import {} from '@trpc/server/adapters/node-http'
import { resolveHTTPResponse } from '@trpc/server/http'
import type { H3Event } from 'h3'
import { getRequestURL, isMethod, readBody, setHeader, setResponseStatus } from 'h3'
import type { CreateContextFn, OnErrorFn, ResponseMetaFn } from '~/trpc/types'

interface TRPCEventHandlerOpts<TRouter extends AnyRouter> {
  router: TRouter
  createContext?: CreateContextFn<TRouter>
  responseMeta?: ResponseMetaFn<TRouter>
  onError?: OnErrorFn<TRouter>
}

export async function handleTRPC<TRouter extends AnyRouter>(
  event: H3Event,
  opts: TRPCEventHandlerOpts<TRouter>
) {
  const { req: request } = event.node
  const url = getRequestURL(event)
  const query = url.searchParams

  // Get everything after /trpc/
  const parts = event.path.split('/trpc/')
  if (parts.length !== 2) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid tRPC path',
    })
  }

  // Return the procedure path
  const path = parts[1].split('?')[0]

  const req: Request = {
    query,
    method: request.method || 'GET',
    headers: request.headers,
    body: isMethod(event, 'GET') ? null : await readBody(event),
  }

  const { status, headers, body } = await resolveHTTPResponse({
    router: opts.router,
    req,
    path,
    createContext: async () => opts.createContext?.(event),
    responseMeta: opts.responseMeta,
    onError: (errorOpts) => {
      opts.onError?.({ ...errorOpts, req })
    },
  })

  setResponseStatus(event, status)

  if (headers) {
    for (const key of Object.keys(headers)) {
      const headerValue = headers[key]
      if (headerValue) {
        setHeader(event, key, headerValue)
      }
    }
  }

  return body
}
