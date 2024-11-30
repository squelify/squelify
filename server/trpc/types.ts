import type { AnyRouter, ProcedureType, TRPCError } from '@trpc/server'
import type { inferRouterContext, inferRouterError } from '@trpc/server'
import type { HTTPRequest, ResponseMeta } from '@trpc/server/http'
import type { TRPCResponse } from '@trpc/server/rpc'
import type { EventHandlerRequest, EventHandlerResponse } from 'h3'
import type { EventHandler, H3Event } from 'h3'

type MaybePromise<T> = T | Promise<T>

export type CreateContextFn<TRouter extends AnyRouter> = (
  event: H3Event
) => MaybePromise<inferRouterContext<TRouter>>

export interface ResponseMetaFnPayload<TRouter extends AnyRouter> {
  data: TRPCResponse<unknown, inferRouterError<TRouter>>[]
  ctx?: inferRouterContext<TRouter>
  paths?: string[]
  type: ProcedureType | 'unknown'
  errors: TRPCError[]
}

export type ResponseMetaFn<TRouter extends AnyRouter> = (
  opts: ResponseMetaFnPayload<TRouter>
) => ResponseMeta

export interface OnErrorPayload<TRouter extends AnyRouter> {
  error: TRPCError
  type: ProcedureType | 'unknown'
  path: string | undefined
  req: HTTPRequest
  input: unknown
  ctx: undefined | inferRouterContext<TRouter>
}

export type OnErrorFn<TRouter extends AnyRouter> = (opts: OnErrorPayload<TRouter>) => void

export type NitroRequestHandler = <
  TRouter extends AnyRouter,
  TRequest extends EventHandlerRequest,
>({
  router,
  createContext,
  responseMeta,
  onError,
}: {
  router: TRouter
  createContext?: CreateContextFn<TRouter>
  responseMeta?: ResponseMetaFn<TRouter>
  onError?: OnErrorFn<TRouter>
}) => EventHandler<TRequest, EventHandlerResponse<string | undefined>>
