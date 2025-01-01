import * as SliderPrimitive from '@radix-ui/react-slider'
import * as React from 'react'
import { sliderStyles } from './slider.css'
import type { SliderVariants } from './slider.css'

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & SliderVariants
>(({ className, size, ...props }, ref) => {
  const styles = sliderStyles({ size })
  return (
    <SliderPrimitive.Root ref={ref} className={styles.root({ className })} {...props}>
      <SliderPrimitive.Track className={styles.track()}>
        <SliderPrimitive.Range className={styles.range()} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={styles.thumb()} />
    </SliderPrimitive.Root>
  )
})

Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
