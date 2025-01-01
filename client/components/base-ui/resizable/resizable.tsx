import * as Lucide from 'lucide-react'
import * as ResizablePrimitive from 'react-resizable-panels'
import { clx } from '#/utils/helper'
import {
  resizableHandleIconStyles,
  resizableHandleStyles,
  resizablePanelGroupStyles,
} from './resizable.css'

interface ResizablePanelGroupProps
  extends React.ComponentProps<typeof ResizablePrimitive.PanelGroup> {
  fixed?: boolean
}

const ResizablePanelGroup = ({ className, fixed, ...props }: ResizablePanelGroupProps) => (
  <ResizablePrimitive.PanelGroup
    className={clx(resizablePanelGroupStyles({ fixed }), className)}
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
    className={clx(resizableHandleStyles(), className)}
    {...props}
  >
    {withHandle && (
      <div className={resizableHandleIconStyles()}>
        <Lucide.GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
