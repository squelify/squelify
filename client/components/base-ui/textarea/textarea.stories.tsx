import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Button } from '../button/button'
import { Label } from '../label/label'
import { Textarea } from './textarea'

const meta: Meta = {
  title: 'Basic Components/Textarea',
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component: `
Textarea component for multi-line text input.

## Example
\`\`\`tsx
import { Textarea } from '#/components/base-ui'

<Textarea placeholder="Type your message here." />
\`\`\``,
      },
    },
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    rows: {
      control: 'number',
      description: 'Number of visible text lines',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Textarea placeholder="Type your message here." />,
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea placeholder="Type your message here." id="message" />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => <Textarea placeholder="You cannot type here..." disabled />,
}

export const WithRows: Story = {
  render: () => <Textarea placeholder="This textarea has 10 rows." rows={10} />,
}

export const WithValue: Story = {
  render: () => <Textarea value="This is a fixed value textarea." readOnly />,
}

export const AdvancedForm: Story = {
  render: () => {
    const [text, setText] = React.useState('')
    const maxLength = 100

    return (
      <div className="grid w-full gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="feedback">Product Feedback</Label>
          <Textarea
            id="feedback"
            placeholder="Share your thoughts about our product..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={maxLength}
          />
          <div className="text-right text-muted-foreground text-sm">
            {text.length}/{maxLength} characters
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setText('')}>
            Clear
          </Button>
          <Button disabled={text.length === 0}>Submit Feedback</Button>
        </div>
      </div>
    )
  },
}

export const AutoResizing: Story = {
  render: () => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    React.useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }, [])

    const handleInput = (_e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }

    return (
      <Textarea
        ref={textareaRef}
        placeholder="I will grow as you type..."
        onInput={handleInput}
        rows={1}
        className="overflow-hidden"
      />
    )
  },
}

export const WithValidation: Story = {
  render: () => {
    const [value, setValue] = React.useState('')
    const [error, setError] = React.useState('')

    const validate = (text: string) => {
      if (text.length < 10) {
        setError('Message must be at least 10 characters')
        return false
      }
      setError('')
      return true
    }

    return (
      <div className="grid gap-1.5">
        <Label htmlFor="message-valid">Your message</Label>
        <Textarea
          id="message-valid"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            validate(e.target.value)
          }}
          className={error ? 'border-destructive' : ''}
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    )
  },
}
