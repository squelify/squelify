import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../button/button'
import { Input } from '../input/input'
import { Label } from '../label/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet'
import type { SheetVariants } from './sheet.css'

const sizeOptions: NonNullable<SheetVariants['size']>[] = ['default', 'sm', 'lg', 'xl', 'full']
const sideOptions: NonNullable<SheetVariants['side']>[] = ['top', 'right', 'bottom', 'left']

const meta: Meta = {
  title: 'Basic Components/Sheet',
  component: Sheet,
  parameters: {
    docs: {
      description: {
        component: `
Sheet component for displaying content in a sliding panel.

## Example Usage
\`\`\`tsx
import { Sheet, SheetTrigger, SheetContent } from '#/components/base-ui'

<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent>Content</SheetContent>
</Sheet>
\`\`\``,
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Sheet size variant',
    },
    side: {
      control: 'inline-radio',
      options: sideOptions,
      description: 'Sheet position',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
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
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const Sides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {sideOptions.map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline">Open {side}</Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>{side} Sheet</SheetTitle>
              <SheetDescription>This sheet slides in from the {side}.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4">
      {sizeOptions.map((size) => (
        <Sheet key={size}>
          <SheetTrigger asChild>
            <Button variant="outline">{size}</Button>
          </SheetTrigger>
          <SheetContent size={size}>
            <SheetHeader>
              <SheetTitle>{size} Sheet</SheetTitle>
              <SheetDescription>This is a {size} sized sheet.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
}
