import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const auditActionEnum = z.enum(['create', 'update', 'delete', 'login', 'logout', 'impersonate'], {
  required_error: 'Action is required',
  invalid_type_error: 'Invalid action type',
})

export type AuditAction = z.infer<typeof auditActionEnum>

const auditEntityEnum = z.enum(
  [
    'user',
    'organization',
    'member',
    'role',
    'permission',
    'invitation',
    'email',
    'password',
    'session',
    'two_factor',
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
  organizationId: z
    .string({
      invalid_type_error: 'Organization ID must be a string',
    })
    .nullable(),
  action: auditActionEnum,
  entity: auditEntityEnum,
  entityId: z.string({
    required_error: 'Entity ID is required',
    invalid_type_error: 'Entity ID must be a string',
  }),
  oldValues: z
    .string({
      invalid_type_error: 'Old values must be a JSON string',
    })
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
    .string({
      invalid_type_error: 'New values must be a JSON string',
    })
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
    .string({
      invalid_type_error: 'Metadata must be a JSON string',
    })
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
    .string({
      invalid_type_error: 'IP address must be a string',
    })
    .ip({ message: 'Invalid IP address format' })
    .nullable(),
  userAgent: z
    .string({
      invalid_type_error: 'User agent must be a string',
    })
    .max(500, 'User agent too long')
    .nullable(),
  createdAt: z.number(),
})

// Database interface for Kysely
export interface AuditLog {
  id: Generated<string>
  userId: ColumnType<string | null>
  organizationId: ColumnType<string | null>
  action: ColumnType<AuditAction>
  entity: ColumnType<AuditEntity>
  entityId: ColumnType<string>
  oldValues: ColumnType<string>
  newValues: ColumnType<string>
  metadata: ColumnType<string>
  ipAddress: ColumnType<string | null>
  userAgent: ColumnType<string | null>
  createdAt: ColumnType<number>
}

// Kysely types for operations
export type AuditLogSelect = Selectable<AuditLog>
export type AuditLogInsert = Insertable<AuditLog>
export type AuditLogUpdate = Updateable<AuditLog>
