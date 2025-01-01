import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as React from 'react'
import { tabsStyles } from './tabs.css'
import type { TabsVariants } from './tabs.css'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & TabsVariants
>(({ className, size, ...props }, ref) => {
  const styles = tabsStyles({ size })
  return <TabsPrimitive.List ref={ref} className={styles.list({ className })} {...props} />
})

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & TabsVariants
>(({ className, size, ...props }, ref) => {
  const styles = tabsStyles({ size })
  return <TabsPrimitive.Trigger ref={ref} className={styles.trigger({ className })} {...props} />
})

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & TabsVariants
>(({ className, size, ...props }, ref) => {
  const styles = tabsStyles({ size })
  return <TabsPrimitive.Content ref={ref} className={styles.content({ className })} {...props} />
})

TabsList.displayName = TabsPrimitive.List.displayName
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
