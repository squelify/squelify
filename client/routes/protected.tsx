import { lazy } from 'react'
import { Navigate, type RouteObject } from 'react-router'

// Lazy load the components for better performance
const AppLayout = lazy(() => import('#/layouts/app-layout'))
const Dashboard = lazy(() => import('#/pages/dashboard/page'))
const UsersList = lazy(() => import('#/pages/users/page'))
const AuditLogs = lazy(() => import('#/pages/audit-log/page'))
const Webhooks = lazy(() => import('#/pages/webhooks/page'))
const ApiKeys = lazy(() => import('#/pages/api-keys/page'))

// Authorization feature group
const AuthzGroup = {
  Layout: lazy(() => import('#/pages/authorization/layout')),
  Roles: lazy(() => import('#/pages/authorization/roles/page')),
  Permissions: lazy(() => import('#/pages/authorization/permissions/page')),
}

// Account feature group
const Account = {
  Layout: lazy(() => import('#/pages/account/layout')),
  Profile: lazy(() => import('#/pages/account/profile/page')),
  Security: lazy(() => import('#/pages/account/security/page')),
  Notification: lazy(() => import('#/pages/account/notification/page')),
  LoginHistory: lazy(() => import('#/pages/account/login-history/page')),
}

// SQL Console feature group
const SQLConsole = {
  Layout: lazy(() => import('#/pages/console/layout')),
  Table: lazy(() => import('#/pages/console/table-editor/page')),
  Query: lazy(() => import('#/pages/console/query-editor/page')),
  Diagram: lazy(() => import('#/pages/diagram/page')),
}

// Content feature group
const ContentGroup = {
  Collections: lazy(() => import('#/pages/collections/page')),
  MediaLibrary: lazy(() => import('#/pages/media-library/page')),
}

// Settings feature group
const Settings = {
  Layout: lazy(() => import('#/pages/settings/layout')),
  General: lazy(() => import('#/pages/settings/general/page')),
  Authentication: lazy(() => import('#/pages/settings/authentication/page')),
  Email: lazy(() => import('#/pages/settings/email/page')),
  Storage: lazy(() => import('#/pages/settings/storage/page')),
  Backup: lazy(() => import('#/pages/settings/backup/page')),
  Logs: lazy(() => import('#/pages/settings/logs/page')),
}

export const protectedRoutes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'audit-log', element: <AuditLogs /> },
      { path: 'webhooks', element: <Webhooks /> },
      { path: 'api-keys', element: <ApiKeys /> },
      { path: 'users', element: <UsersList /> },
      {
        path: 'authorization',
        element: <AuthzGroup.Layout />,
        children: [
          { index: true, element: <Navigate to="roles" replace /> },
          { path: 'roles', element: <AuthzGroup.Roles /> },
          { path: 'permissions', element: <AuthzGroup.Permissions /> },
        ],
      },
      {
        path: 'account',
        element: <Account.Layout />,
        children: [
          { index: true, element: <Navigate to="profile" replace /> },
          { path: 'profile', element: <Account.Profile /> },
          { path: 'security', element: <Account.Security /> },
          { path: 'notification', element: <Account.Notification /> },
          { path: 'login-history', element: <Account.LoginHistory /> },
        ],
      },
      {
        path: 'console',
        element: <SQLConsole.Layout />,
        children: [
          { index: true, element: <Navigate to="table" replace /> },
          { path: 'table', element: <SQLConsole.Table /> },
          { path: 'query', element: <SQLConsole.Query /> },
        ],
      },
      { path: 'diagram', element: <SQLConsole.Diagram /> },
      {
        path: 'content',
        children: [
          { index: true, element: <Navigate to="collections" replace /> },
          { path: 'collections', element: <ContentGroup.Collections /> },
          { path: 'media-library', element: <ContentGroup.MediaLibrary /> },
        ],
      },
      {
        path: 'settings',
        element: <Settings.Layout />,
        children: [
          { index: true, element: <Navigate to="general" replace /> },
          { path: 'general', element: <Settings.General /> },
          { path: 'authentication', element: <Settings.Authentication /> },
          { path: 'email', element: <Settings.Email /> },
          { path: 'storage', element: <Settings.Storage /> },
          { path: 'backup', element: <Settings.Backup /> },
          { path: 'logs', element: <Settings.Logs /> },
        ],
      },
    ],
  },
]
