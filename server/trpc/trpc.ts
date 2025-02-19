import { TRPCError, initTRPC } from '@trpc/server'
import { deserialize, serialize } from 'seroval'
import { ZodError } from 'zod'
import type { Context } from './context'

const t = initTRPC.context<Context>().create({
  transformer: { serialize, deserialize },
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    }
  },
})

/**
 * Middleware to verify if user is authenticated
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.event.context.auth?.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      session: ctx.event.context.auth?.session,
    },
  })
})

/**
 * Create a router
 * @see https://trpc.io/docs/v11/router
 */
export const trpcRouter = t.router

/**
 * Create an unprotected procedure
 * @see https://trpc.io/docs/v11/procedures
 */
export const publicProcedure = t.procedure

/**
 * Create a protected procedure that requires authentication
 * @see https://trpc.io/docs/v11/procedures
 */
export const protectedProcedure = t.procedure.use(isAuthed)

/**
 * @see https://trpc.io/docs/v11/middlewares
 */
export const middleware = t.middleware

/**
 * @see https://trpc.io/docs/v11/merging-routers
 */
export const mergeRouters = t.mergeRouters
