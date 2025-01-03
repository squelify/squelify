import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../button/button'
import { Input } from '../input/input'
import { Label } from '../label/label'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer'
import type { DrawerVariants } from './drawer.css'

const sizeOptions: NonNullable<DrawerVariants['size']>[] = ['default', 'sm', 'lg']
const sideOptions: NonNullable<DrawerVariants['side']>[] = ['top', 'bottom', 'left', 'right']

const meta: Meta = {
  title: 'Basic Components/Drawer',
  component: Drawer,
  parameters: {
    docs: {
      description: {
        component: `
Drawer component for displaying content in a sliding panel.

## Example Usage
\`\`\`tsx
import { Drawer, DrawerTrigger, DrawerContent } from '#/components/base-ui'

<Drawer>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>Content</DrawerContent>
</Drawer>
\`\`\``,
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Drawer size variant',
    },
    side: {
      control: 'inline-radio',
      options: sideOptions,
      description: 'Drawer position',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <div className="grid gap-4 p-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" value="@peduarte" className="col-span-3" />
          </div>
        </div>
        <DrawerFooter>
          <Button>Save changes</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

export const Sides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {sideOptions.map((side) => (
        <Drawer key={side} side={side}>
          <DrawerTrigger asChild>
            <Button variant="outline">Open {side}</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{side} Drawer</DrawerTitle>
              <DrawerDescription>This drawer slides from the {side}.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4">
      {sizeOptions.map((size) => (
        <Drawer key={size} size={size}>
          <DrawerTrigger asChild>
            <Button variant="outline">{size} drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{size} Drawer</DrawerTitle>
              <DrawerDescription>This is a {size} sized drawer.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  ),
}
