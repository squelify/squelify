import * as React from 'react'
import { sidebarStyles } from './sidebar.css'
import type { SidebarVariants } from './sidebar.css'

type SidebarContextValue = {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  collapsible: 'icon' | 'offcanvas' | false
  side: 'left' | 'right'
  variant: SidebarVariants['variant']
  size: SidebarVariants['size']
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, SidebarVariants {
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  collapsible?: 'icon' | 'offcanvas' | false
  side?: 'left' | 'right'
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      variant = 'sidebar',
      size = 'default',
      collapsed = false,
      defaultCollapsed = false,
      onCollapsedChange,
      collapsible = false,
      side = 'left',
      children,
      ...props
    },
    ref
  ) => {
    const styles = sidebarStyles({ variant, size })
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

    const handleCollapsedChange = React.useCallback(
      (value: boolean) => {
        setIsCollapsed(value)
        onCollapsedChange?.(value)
      },
      [onCollapsedChange]
    )

    const contextValue = React.useMemo(
      () => ({
        collapsed: collapsed || isCollapsed,
        setCollapsed: handleCollapsedChange,
        collapsible,
        side,
        variant,
        size,
      }),
      [collapsed, isCollapsed, handleCollapsedChange, collapsible, side, variant, size]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={styles.wrapper({ className })}
          data-variant={variant}
          data-side={side}
          data-state={contextValue.collapsed ? 'collapsed' : 'expanded'}
          data-collapsible={collapsible}
          {...props}
        >
          <aside className={styles.sidebar()}>{children}</aside>
          {collapsible && (
            <div
              className={styles.rail()}
              onClick={() => handleCollapsedChange(!contextValue.collapsed)}
            />
          )}
        </div>
      </SidebarContext.Provider>
    )
  }
)

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const styles = sidebarStyles()
    return <div ref={ref} className={styles.header({ className })} {...props} />
  }
)

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const styles = sidebarStyles()
    return <div ref={ref} className={styles.content({ className })} {...props} />
  }
)

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const styles = sidebarStyles()
    return <div ref={ref} className={styles.footer({ className })} {...props} />
  }
)

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label?: React.ReactNode
    action?: React.ReactNode
  }
>(({ className, label, action, children, ...props }, ref) => {
  const styles = sidebarStyles()
  return (
    <div ref={ref} className={styles.group({ className })} {...props}>
      {label && <div className={styles.groupLabel()}>{label}</div>}
      {action && <div className={styles.groupAction()}>{action}</div>}
      {children}
    </div>
  )
})

const SidebarMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const styles = sidebarStyles()
    return <div ref={ref} className={styles.menu({ className })} {...props} />
  }
)

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  action?: React.ReactNode
  badge?: React.ReactNode
}

const SidebarMenuItem = React.forwardRef<HTMLDivElement, SidebarMenuItemProps>(
  ({ className, active, disabled, icon, action, badge, children, ...props }, ref) => {
    const { size } = useSidebar()
    const styles = sidebarStyles({ size })

    return (
      <div ref={ref} className={styles.menuItem({ className })} {...props}>
        <button
          type="button"
          className={styles.menuButton()}
          disabled={disabled}
          data-active={active}
          data-size={size}
        >
          {icon}
          <span>{children}</span>
        </button>
        {action && (
          <button type="button" className={styles.menuAction()} data-sidebar="menu-action">
            {action}
          </button>
        )}
        {badge && <div className={styles.menuBadge()}>{badge}</div>}
      </div>
    )
  }
)

const SidebarMenuSub = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const styles = sidebarStyles()
    return <div ref={ref} className={styles.menuSub({ className })} {...props} />
  }
)

interface SidebarMenuSubItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  icon?: React.ReactNode
}

const SidebarMenuSubItem = React.forwardRef<HTMLButtonElement, SidebarMenuSubItemProps>(
  ({ className, active, icon, children, ...props }, ref) => {
    const styles = sidebarStyles()
    return (
      <button
        ref={ref}
        className={styles.menuSubButton({ className })}
        data-active={active}
        {...props}
      >
        {icon}
        <span>{children}</span>
      </button>
    )
  }
)

Sidebar.displayName = 'Sidebar'
SidebarHeader.displayName = 'SidebarHeader'
SidebarContent.displayName = 'SidebarContent'
SidebarFooter.displayName = 'SidebarFooter'
SidebarGroup.displayName = 'SidebarGroup'
SidebarMenu.displayName = 'SidebarMenu'
SidebarMenuItem.displayName = 'SidebarMenuItem'
SidebarMenuSub.displayName = 'SidebarMenuSub'
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem'

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
}
