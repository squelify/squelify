import * as Lucide from 'lucide-react'
import * as ResizablePrimitive from 'react-resizable-panels'
import { resizableStyles } from './resizable.css'
import type { ResizableVariants } from './resizable.css'

type ResizablePanelGroupProps = React.ComponentProps<typeof ResizablePrimitive.PanelGroup> &
  ResizableVariants

const ResizablePanelGroup = ({
  className,
  fixed,
  direction,
  ...props
}: ResizablePanelGroupProps) => {
  const styles = resizableStyles({ fixed, direction })
  return (
    <ResizablePrimitive.PanelGroup
      className={styles.panelGroup({ className })}
      direction={direction}
      {...props}
    />
  )
}

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => {
  const styles = resizableStyles()
  return (
    <ResizablePrimitive.PanelResizeHandle className={styles.handle({ className })} {...props}>
      {withHandle && (
        <div className={styles.handleIcon()}>
          <Lucide.GripVertical className={styles.icon()} />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
