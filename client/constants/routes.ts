export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Protected routes
  DASHBOARD: '/dashboard',
  ACCOUNT: {
    ROOT: '/account',
    PROFILE: '/account/profile',
  },
  SETTINGS: {
    ROOT: '/settings',
    GENERAL: '/settings/general',
  },

  // Admin routes
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
  },
} as const
