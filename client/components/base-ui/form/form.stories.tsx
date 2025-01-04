import { zodResolver } from '@hookform/resolvers/zod'
import type { Meta, StoryObj } from '@storybook/react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '../button/button'
import { Input } from '../input/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form'
import type { FormVariants } from './form.css'

const sizeOptions: NonNullable<FormVariants['size']>[] = ['default', 'sm', 'lg']

const formSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
})

const meta: Meta = {
  title: 'Basic Components/Form',
  component: Form,
  parameters: {
    docs: {
      description: {
        component: `
Form component built on top of React Hook Form.

## Example
\`\`\`tsx
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '#/components/base-ui'

function ProfileForm() {
  const form = useForm()
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  )
}
\`\`\``,
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Form control size variant',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: '',
        email: '',
      },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
      console.info(values)
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe" {...field} />
                </FormControl>
                <FormDescription>This is your public display name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    )
  },
}

export const WithValidation: Story = {
  render: () => {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: '',
        email: 'invalid-email',
      },
    })

    return (
      <Form {...form}>
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    )
  },
}

export const SizeShowcase: Story = {
  render: () => (
    <div className="space-y-8">
      {sizeOptions.map((size) => (
        <FormField
          key={size}
          name={`field-${size}`}
          render={() => (
            <FormItem>
              <FormLabel>{size} input</FormLabel>
              <FormControl size={size}>
                <Input placeholder={`${size} input`} />
              </FormControl>
            </FormItem>
          )}
        />
      ))}
    </div>
  ),
}
