import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardContent } from '../card/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel'
import type { CarouselVariants } from './carousel.css'

const orientationOptions: NonNullable<CarouselVariants['orientation']>[] = [
  'horizontal',
  'vertical',
]
const sizeOptions: NonNullable<CarouselVariants['size']>[] = ['default', 'sm', 'lg']

const CAROUSEL_ITEMS = [
  { id: 'slide-1', content: '1' },
  { id: 'slide-2', content: '2' },
  { id: 'slide-3', content: '3' },
  { id: 'slide-4', content: '4' },
  { id: 'slide-5', content: '5' },
]

const meta: Meta = {
  title: 'Basic Components/Carousel',
  component: Carousel,
  parameters: {
    docs: {
      description: {
        component: `
Carousel component for cycling through elements.

## Example
\`\`\`tsx
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '#/components/base-ui'

<Carousel>
  <CarouselContent>
    <CarouselItem>Item 1</CarouselItem>
    <CarouselItem>Item 2</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
\`\`\``,
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: orientationOptions,
      description: 'Carousel orientation',
      table: {
        type: { summary: 'CarouselVariants["orientation"]' },
      },
    },
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Navigation buttons size',
      table: {
        type: { summary: 'CarouselVariants["size"]' },
      },
    },
    opts: {
      control: 'object',
      description: 'Embla Carousel options',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {CAROUSEL_ITEMS.map((item) => (
          <CarouselItem key={item.id}>
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="font-semibold text-4xl">{item.content}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

export const Vertical: Story = {
  render: () => (
    <Carousel orientation="vertical" className="w-full max-w-xs">
      <CarouselContent>
        {CAROUSEL_ITEMS.map((item) => (
          <CarouselItem key={item.id}>
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="font-semibold text-4xl">{item.content}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

export const SizeShowcase: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {['sm', 'default', 'lg'].map((size) => (
        <Carousel
          key={`carousel-${size}`}
          size={size as CarouselVariants['size']}
          className="w-full max-w-xs"
        >
          <CarouselContent>
            {CAROUSEL_ITEMS.slice(0, 3).map((item) => (
              <CarouselItem key={`${size}-${item.id}`}>
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="font-semibold text-4xl">{item.content}</span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ))}
    </div>
  ),
}

export const WithCustomOptions: Story = {
  render: () => (
    <Carousel opts={{ align: 'start' }} className="w-full max-w-xs">
      <CarouselContent>
        {CAROUSEL_ITEMS.map((item) => (
          <CarouselItem key={item.id} className="basis-1/2">
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="font-semibold text-4xl">{item.content}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}
