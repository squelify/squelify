import * as Lucide from 'lucide-react'
import * as ResizablePrimitive from 'react-resizable-panels'
import { clx } from '#/utils/helper'

interface ResizablePanelGroupProps
  extends React.ComponentProps<typeof ResizablePrimitive.PanelGroup> {
  fixed?: boolean
}

const ResizablePanelGroup = ({ className, fixed, ...props }: ResizablePanelGroupProps) => (
  <ResizablePrimitive.PanelGroup
    className={clx(
      'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
      fixed && 'fixed inset-0',
      className
    )}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={clx(
      'group relative flex w-px items-center justify-center bg-border transition-colors hover:bg-foreground/20',
      'after:-translate-x-1/2 after:absolute after:inset-y-0 after:left-1/2 after:w-1',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1',
      'data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full',
      'data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1',
      'data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0',
      '[&[data-panel-group-direction=vertical]>div]:rotate-90',
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border opacity-0 transition-opacity group-hover:opacity-100">
        <Lucide.GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
