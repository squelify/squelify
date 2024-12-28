import { Suspense } from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router'
import PageLoader from '#/components/loaders/page-loader'
import { useAuth } from '#/context/hooks/use-auth'
import { clx } from '#/utils/helper'

const styles = {
  layout: 'min-h-screen bg-sidebar-background',
  sidebar:
    'fixed top-0 left-0 h-screen w-64 bg-white border-r border-sidebar-border p-4 flex flex-col bg-sidebar-background',
  sidebarHeader: 'mb-8',
  sidebarTitle: 'text-xl font-bold text-slate-800',
  navGroup: 'space-y-2 flex-1', // tambah flex-1 untuk spacing
  navLink: {
    base: 'flex items-center px-4 py-2 rounded-lg transition-colors',
    active: 'bg-brand-50 text-brand-600',
    inactive: 'text-slate-600 hover:bg-slate-100',
  },
  logoutButton:
    'flex items-center px-4 py-2 mt-auto text-red-600 hover:bg-red-50 rounded-lg transition-colors',
  main: 'ml-64 p-8',
} as const

export default function AppLayout() {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={`/login?redirect_to=${location.pathname}`} state={{ from: location }} replace />
    )
  }

  return (
    <div className={styles.layout}>
      <nav className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>App Name</h1>
        </div>

        <div className={styles.navGroup}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              clx(styles.navLink.base, isActive ? styles.navLink.active : styles.navLink.inactive)
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/settings/general"
            className={({ isActive }) =>
              clx(styles.navLink.base, isActive ? styles.navLink.active : styles.navLink.inactive)
            }
          >
            Settings
          </NavLink>

          <NavLink
            to="/account/profile"
            className={({ isActive }) =>
              clx(styles.navLink.base, isActive ? styles.navLink.active : styles.navLink.inactive)
            }
          >
            Account
          </NavLink>
        </div>

        <button type="button" onClick={logout} className={styles.logoutButton}>
          Logout
        </button>
      </nav>

      <main className={styles.main}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
