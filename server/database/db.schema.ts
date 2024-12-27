/**
 * For Kysely's type-safety and autocompletion to work, it needs to know
 * your database structure. This requires a TypeScript Database interface,
 * that contains table names as keys and table schema interfaces as values.
 *
 * @see: https://www.kysely.dev/docs/recipes/schemas
 */

import type { IEmail } from './schemas/email'
import type { ISuperuser } from './schemas/superuser'
import type { IUser } from './schemas/user'

interface InternalSchema {
  'internal.superusers': ISuperuser
}

export interface Database extends InternalSchema {
  emails: IEmail
  users: IUser
}
