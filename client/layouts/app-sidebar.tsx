import * as Lucide from 'lucide-react'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Button } from '#/components/base-ui'
import { SidebarFooter, SidebarHeader } from '#/components/base-ui'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '#/components/base-ui'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '#/components/base-ui'
import { Sidebar, SidebarContent, useSidebar } from '#/components/base-ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '#/components/base-ui'
import { Link } from '#/components/base-ui'
import { MenuItem, useMenu } from '#/context/hooks/use-menu'
import { useTheme } from '#/context/hooks/use-theme'
import { clx } from '#/utils/helper'
import AppCommand, { CommandMenuGroup } from './app-command'
import UserMenu from './user-menu'

interface AppSidebarProps {
  user: any
  logout: () => void
}

interface MenuItemProps {
  item: MenuItem
  isActive: boolean
}

const CollapsedMenuItem = ({ item, isActive }: MenuItemProps) => (
  <Tooltip delayDuration={100}>
    <TooltipTrigger asChild>
      <SidebarMenuButton className={clx(isActive && 'bg-accent text-accent-foreground')} asChild>
        <Link href={item.url}>
          <item.icon className={clx(isActive && 'bg-accent text-primary')} strokeWidth={1.8} />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </TooltipTrigger>
    <TooltipContent side="right">
      <p>{item.title}</p>
    </TooltipContent>
  </Tooltip>
)

const ExpandedMenuItem = ({ item, isActive }: MenuItemProps) => (
  <SidebarMenuButton className={clx(isActive && 'bg-accent text-accent-foreground')} asChild>
    <Link href={item.url}>
      <item.icon className={clx(isActive && 'bg-accent text-primary')} strokeWidth={1.8} />
      <span>{item.title}</span>
    </Link>
  </SidebarMenuButton>
)

export default function AppSidebar({ user, logout }: AppSidebarProps) {
  const { state: sidebarState, toggleSidebar } = useSidebar()
  const { pathname } = useLocation()
  const { menuGroups } = useMenu()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  // Helper to check the active state of the menu
  const isMenuActive = (itemUrl: string): boolean => {
    const specialPaths = ['/settings', '/console', '/content', '/authorization']
    const isSpecialPath = specialPaths.some((path) => itemUrl.startsWith(path))
    return isSpecialPath ? pathname.startsWith(itemUrl) : pathname === itemUrl
  }

  const commandMenuItems: CommandMenuGroup[] = useMemo(
    () => [
      {
        id: 'main-nav',
        heading: 'Overview',
        items: [
          {
            id: 'dashboard',
            icon: Lucide.LayoutDashboard,
            label: 'Dashboard',
            onSelect: () => navigate('/dashboard'),
            shortcut: '/dashboard',
          },
        ],
        showSeparator: true,
      },
      {
        id: 'database',
        heading: 'Database',
        items: [
          {
            id: 'table-editor',
            icon: Lucide.Table2,
            label: 'Table Editor',
            onSelect: () => navigate('/console/table'),
            shortcut: '/console/table',
          },
          {
            id: 'query-editor',
            icon: Lucide.SquareChartGantt,
            label: 'Query Editor',
            onSelect: () => navigate('/console/query'),
            shortcut: '/console/query',
          },
          {
            id: 'schema-diagram',
            icon: Lucide.Proportions,
            label: 'Schema Diagram',
            onSelect: () => navigate('/diagram'),
            shortcut: '/diagram',
          },
        ],
        showSeparator: false,
      },
      {
        id: 'content',
        heading: 'Manage Content',
        items: [
          {
            id: 'collections',
            icon: Lucide.Database,
            label: 'Collections',
            onSelect: () => navigate('/content/collections'),
            shortcut: '/content/collections',
          },
          {
            id: 'media-library',
            icon: Lucide.Image,
            label: 'Media Library',
            onSelect: () => navigate('/content/media-library'),
            shortcut: '/content/media-library',
          },
        ],
        showSeparator: false,
      },
      {
        id: 'authentication',
        heading: 'Authentication',
        items: [
          {
            id: 'users',
            icon: Lucide.Users,
            label: 'Users',
            onSelect: () => navigate('/users'),
            shortcut: '/users',
          },
          {
            id: 'roles',
            icon: Lucide.KeySquare,
            label: 'Roles',
            onSelect: () => navigate('/authorization/roles'),
            shortcut: '/authorization/roles',
          },
          {
            id: 'permissions',
            icon: Lucide.SquareAsterisk,
            label: 'Permissions',
            onSelect: () => navigate('/authorization/permissions'),
            shortcut: '/authorization/permissions',
          },
        ],
        showSeparator: true,
      },
      {
        id: 'miscellaneous',
        heading: 'Miscellaneous',
        items: [
          {
            id: 'toggle-sidebar',
            icon: Lucide.PanelRightOpen,
            label: 'Toggle Sidebar',
            onSelect: toggleSidebar,
            shortcut: '⌘+shift+e',
          },
          {
            id: 'toggle-theme',
            icon: Lucide.SunMoon,
            label: 'Toggle Theme',
            onSelect: () => setTheme(theme === 'light' ? 'dark' : 'light'),
          },
        ],
        showSeparator: true,
      },
      {
        id: 'resources',
        heading: 'Resources',
        items: [
          { id: 'docs', icon: Lucide.BookUser, label: 'Documentation' },
          { id: 'changelog', icon: Lucide.NotebookText, label: 'Release Notes' },
        ],
        showSeparator: true,
      },
      {
        id: 'account',
        heading: 'Account',
        items: [
          {
            id: 'profile',
            icon: Lucide.UserCog,
            label: 'Profile',
            onSelect: () => navigate('/account/profile'),
            shortcut: '/account/profile',
          },
          {
            id: 'logout',
            icon: Lucide.LogOut,
            label: 'Sign out',
            onSelect: () => logout(),
            shortcut: '/signout',
          },
        ],
      },
    ],
    [navigate, toggleSidebar, theme, setTheme, logout]
  )

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Sidebar Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none select-none">
              <div className="flex aspect-square size-8 items-center justify-center bg-transparent p-0.5">
                <img src="/favicon.svg" className="size-8" alt="logo" />
              </div>
              <div
                className={clx(
                  sidebarState === 'expanded' ? 'flex' : 'hidden',
                  'ml-0.5 flex-col gap-0.5 leading-none'
                )}
              >
                <span className="font-semibold">Squelify</span>
                <span className="text-xs">v{import.meta.env.SQUELIFY_VERSION}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarGroup
          className={clx(sidebarState === 'expanded' ? 'flex' : 'hidden', 'w-full p-0')}
        >
          <SidebarGroupContent>
            <AppCommand menuItems={commandMenuItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        <TooltipProvider>
          {menuGroups.map((group) => (
            <SidebarGroup key={group.label}>
              {!group.hideLabel && (
                <SidebarGroupLabel className="pointer-events-none">{group.label}</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      {sidebarState === 'collapsed' ? (
                        <CollapsedMenuItem item={item} isActive={isMenuActive(item.url)} />
                      ) : (
                        <ExpandedMenuItem item={item} isActive={isMenuActive(item.url)} />
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </TooltipProvider>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        <SidebarMenu
          className={clx(
            sidebarState === 'expanded' ? 'gap-0.5' : 'gap-2',
            'flex flex-col group-data-[state=expanded]:flex-row group-data-[state=expanded]:items-center'
          )}
        >
          <SidebarMenuItem
            className={clx(sidebarState === 'expanded' ? 'order-1' : 'order-2', 'flex-1')}
          >
            <UserMenu user={user} sidebarState={sidebarState} logout={logout} />
          </SidebarMenuItem>
          <SidebarMenuItem
            className={clx(sidebarState === 'expanded' ? 'order-2' : 'order-1', 'h-full w-8')}
          >
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    data-sidebar="trigger"
                    variant="ghost"
                    size="icon"
                    className={clx(
                      sidebarState === 'expanded' ? 'size-full' : 'size-8',
                      'text-muted-foreground'
                    )}
                    onClick={toggleSidebar}
                  >
                    {sidebarState === 'expanded' ? (
                      <Lucide.ArrowLeftToLine strokeWidth={2} />
                    ) : (
                      <Lucide.ArrowRightToLine strokeWidth={2} />
                    )}
                    <span className="sr-only">Toggle Sidebar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={sidebarState === 'collapsed' ? 'right' : 'top'}>
                  <p>Toggle Sidebar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
