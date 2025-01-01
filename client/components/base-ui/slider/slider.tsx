import * as SliderPrimitive from '@radix-ui/react-slider'
import * as React from 'react'
import { clx } from '#/utils/helper'
import {
  sliderRangeStyles,
  sliderRootStyles,
  sliderThumbStyles,
  sliderTrackStyles,
} from './slider.css'

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root ref={ref} className={clx(sliderRootStyles(), className)} {...props}>
    <SliderPrimitive.Track className={sliderTrackStyles()}>
      <SliderPrimitive.Range className={sliderRangeStyles()} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={sliderThumbStyles()} />
  </SliderPrimitive.Root>
))

Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
