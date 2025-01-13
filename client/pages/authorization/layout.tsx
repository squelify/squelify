import { ErrorBoundary } from 'react-error-boundary'
import { Outlet, useLocation } from 'react-router'
import { Separator, Tabs, TabsList, TabsTrigger } from '#/components/base-ui'
import { Link } from '#/components/base-ui'
import BoundaryError from '#/components/errors/boundary'

export default function AuthorizationLayout() {
  const location = useLocation()

  // Extract the active section from the path
  const activeSection = location.pathname.split('/authorization/')[1] || 'roles'

  return (
    <ErrorBoundary FallbackComponent={BoundaryError}>
      <div className="container mx-auto w-full space-y-4 p-4 md:space-y-6 md:p-6 lg:p-8">
        <header className="space-y-0.5">
          <h1 className="font-semibold text-2xl tracking-tight">Authorization</h1>
          <p className="text-muted-foreground text-sm">Manage roles and permissions</p>
        </header>

        <Separator className="my-6" />

        <Tabs value={activeSection} defaultValue={activeSection} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="roles" asChild>
              <Link href="/authorization/roles">Roles</Link>
            </TabsTrigger>
            <TabsTrigger value="permissions" asChild>
              <Link href="/authorization/permissions">Permissions</Link>
            </TabsTrigger>
          </TabsList>

          <div className="min-h-[400px] w-full">
            <Outlet />
          </div>
        </Tabs>
      </div>
    </ErrorBoundary>
  )
}
