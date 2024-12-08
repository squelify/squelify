import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import PageLoader from '#/components/page-loader'

// Core layouts and pages
const AppLayout = lazy(() => import('#/layouts/app-layout'))
const NotFound = lazy(() => import('#/pages/error/not-found'))
const InternalError = lazy(() => import('#/pages/error/internal-error'))
const Dashboard = lazy(() => import('#/pages/dashboard'))
const Account = lazy(() => import('#/pages/account/page'))
const AuditLog = lazy(() => import('#/pages/audit-log/page'))
const Webhooks = lazy(() => import('#/pages/webhooks/page'))
const ApiKeys = lazy(() => import('#/pages/api-keys/page'))
const UsersList = lazy(() => import('#/pages/users/page'))

// Auth feature group
const AuthGroup = {
  Layout: lazy(() => import('#/layouts/auth-layout')),
  SignIn: lazy(() => import('#/pages/auth/login')),
  SignUp: lazy(() => import('#/pages/auth/signup')),
  ForgotPassword: lazy(() => import('#/pages/auth/password/forgot')),
  ResetPassword: lazy(() => import('#/pages/auth/password/reset')),
}

// Authorization feature group
const AuthzGroup = {
  Layout: lazy(() => import('#/pages/authorization/layout')),
  Roles: lazy(() => import('#/pages/authorization/roles/page')),
  Permissions: lazy(() => import('#/pages/authorization/permissions/page')),
}

// SQL Console feature group
const SQLConsoleGroup = {
  Layout: lazy(() => import('#/pages/console/layout')),
  Table: lazy(() => import('#/pages/console/table-editor/page')),
  Query: lazy(() => import('#/pages/console/query-editor/page')),
}

// Content feature group
const ContentGroup = {
  Collections: lazy(() => import('#/pages/collections/page')),
  MediaLibrary: lazy(() => import('#/pages/media-library/page')),
}

// Settings feature group
const SettingsGroup = {
  Layout: lazy(() => import('#/pages/settings/layout')),
  General: lazy(() => import('#/pages/settings/general/page')),
  Authentication: lazy(() => import('#/pages/settings/authentication/page')),
  Email: lazy(() => import('#/pages/settings/email/page')),
  Storage: lazy(() => import('#/pages/settings/storage/page')),
  Backup: lazy(() => import('#/pages/settings/backup/page')),
  Logs: lazy(() => import('#/pages/settings/logs/page')),
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthGroup.Layout />} errorElement={<InternalError />}>
          <Route path="login" element={<AuthGroup.SignIn />} />
          <Route path="signup" element={<AuthGroup.SignUp />} />
          <Route path="forgot-password" element={<AuthGroup.ForgotPassword />} />
          <Route path="reset-password" element={<AuthGroup.ResetPassword />} />
        </Route>

        {/* Protected routes */}
        <Route element={<AppLayout />} errorElement={<InternalError />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="account" element={<Account />} />
          <Route path="audit-log" element={<AuditLog />} />
          <Route path="webhooks" element={<Webhooks />} />
          <Route path="api-keys" element={<ApiKeys />} />

          <Route
            path="console"
            element={<SQLConsoleGroup.Layout />}
            errorElement={<InternalError />}
          >
            <Route index={true} element={<Navigate to="table" replace />} />
            <Route path="table" element={<SQLConsoleGroup.Table />} />
            <Route path="query" element={<SQLConsoleGroup.Query />} />
          </Route>

          {/* User management routes */}
          <Route path="users" element={<UsersList />} />
          <Route
            path="authorization"
            element={<AuthzGroup.Layout />}
            errorElement={<InternalError />}
          >
            <Route index={true} element={<Navigate to="roles" replace />} />
            <Route path="roles" element={<AuthzGroup.Roles />} />
            <Route path="permissions" element={<AuthzGroup.Permissions />} />
          </Route>

          {/* Content management routes */}
          <Route path="content" errorElement={<InternalError />}>
            <Route index={true} element={<Navigate to="collections" replace />} />
            <Route path="collections" element={<ContentGroup.Collections />} />
            <Route path="media" element={<ContentGroup.MediaLibrary />} />
          </Route>

          {/* Settings routes */}
          <Route path="settings" element={<SettingsGroup.Layout />}>
            <Route index element={<Navigate to="general" replace />} />
            <Route path="general" element={<SettingsGroup.General />} />
            <Route path="auth" element={<SettingsGroup.Authentication />} />
            <Route path="email" element={<SettingsGroup.Email />} />
            <Route path="storage" element={<SettingsGroup.Storage />} />
            <Route path="backup" element={<SettingsGroup.Backup />} />
            <Route path="logs" element={<SettingsGroup.Logs />} />
          </Route>
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<NotFound />} errorElement={<InternalError />} />
      </Routes>
    </Suspense>
  )
}
