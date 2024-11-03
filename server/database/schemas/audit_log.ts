import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const auditActionEnum = z.enum(
  [
    'create',
    'delete',
    'disable',
    'authenticate',
    'enable',
    'forgot',
    'impersonate',
    'invite',
    'login',
    'logout',
    'recovery',
    'refresh',
    'reset',
    'update',
    'verify',
  ],
  {
    required_error: 'Action is required',
    invalid_type_error: 'Invalid action type',
  }
)

export type AuditAction = z.infer<typeof auditActionEnum>

const auditEntityEnum = z.enum(
  [
    'email',
    'invitation',
    'jwk',
    'org:member',
    'organization',
    'passkey',
    'password',
    'permission',
    'token',
    'role',
    'session',
    'two_factor',
    'user',
  ],
  {
    required_error: 'Entity is required',
    invalid_type_error: 'Invalid entity type',
  }
)

export type AuditEntity = z.infer<typeof auditEntityEnum>

// Audit log schema with validation rules
export const AuditLogSchema = z.object({
  id: z.string({
    required_error: 'ID is required',
    invalid_type_error: 'ID must be a string',
  }),
  userId: z.string().nullable(),
  organizationId: z.string({ invalid_type_error: 'Organization ID must be a string' }).nullable(),
  action: auditActionEnum,
  entity: auditEntityEnum,
  entityId: z.string({
    required_error: 'Entity ID is required',
    invalid_type_error: 'Entity ID must be a string',
  }),
  oldValues: z
    .string({ invalid_type_error: 'Old values must be a JSON string' })
    .default('{}')
    .transform((val) => {
      try {
        JSON.parse(val)
        return val
      } catch {
        throw new Error('Old values must be a valid JSON string')
      }
    }),
  newValues: z
    .string({ invalid_type_error: 'New values must be a JSON string' })
    .default('{}')
    .transform((val) => {
      try {
        JSON.parse(val)
        return val
      } catch {
        throw new Error('New values must be a valid JSON string')
      }
    }),
  metadata: z
    .string({ invalid_type_error: 'Metadata must be a JSON string' })
    .default('{}')
    .transform((val) => {
      try {
        JSON.parse(val)
        return val
      } catch {
        throw new Error('Metadata must be a valid JSON string')
      }
    }),
  ipAddress: z
    .string({ invalid_type_error: 'IP address must be a string' })
    .ip({ message: 'Invalid IP address format' })
    .nullable(),
  userAgent: z
    .string({ invalid_type_error: 'User agent must be a string' })
    .max(500, 'User agent too long')
    .nullable(),
  createdAt: z.custom<ColumnType<number>>().optional(),
})

// Table interface for Kysely
export type IAuditLog = z.infer<typeof AuditLogSchema>

// Kysely types for operations
export type AuditLog = Selectable<IAuditLog>
export type AuditLogInsert = Insertable<IAuditLog>
export type AuditLogUpdate = Updateable<IAuditLog>
