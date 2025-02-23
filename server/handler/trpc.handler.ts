import { type AnyTRPCRouter, TRPCError, type inferRouterContext } from '@trpc/server'
import {
  type HTTPBaseHandlerOptions,
  type TRPCRequestInfo,
  resolveResponse,
} from '@trpc/server/http'
import type { ResolveHTTPRequestOptionsContextFn } from '@trpc/server/http'
import type { H3Event, NodeIncomingMessage } from 'h3'
import { readBody, toWebRequest } from 'h3'

type MaybePromise<T> = T | Promise<T>

export type CreateContextFn<TRouter extends AnyTRPCRouter> = (
  event: H3Event,
  innerOptions: { info: TRPCRequestInfo },
) => MaybePromise<inferRouterContext<TRouter>>

type H3HandlerOptions<TRouter extends AnyTRPCRouter> = HTTPBaseHandlerOptions<
  TRouter,
  NodeIncomingMessage
> & {
  createContext?: CreateContextFn<TRouter>
}

export async function handleTRPC<TRouter extends AnyTRPCRouter>(
  event: H3Event,
  opts: H3HandlerOptions<TRouter>,
) {
  const createContext: ResolveHTTPRequestOptionsContextFn<TRouter> = async (innerOpts) => {
    return await opts.createContext?.(event, innerOpts)
  }

  const { req } = event.node

  // Get everything after /trpc/
  const parts = event.path.split('/trpc/')

  if (parts.length !== 2) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid tRPC path' })
  }

  // monkey-patch body to the IncomingMessage
  if (event.method === 'POST') {
    ;(req as any).body = await readBody(event)
  }

  const httpResponse = await resolveResponse({
    ...opts,
    req: toWebRequest(event),
    error: null,
    createContext,
    path: parts[1].split('?')[0],
    onError(o) {
      opts.onError?.({ ...o, req })
    },
  })

  return httpResponse
}
