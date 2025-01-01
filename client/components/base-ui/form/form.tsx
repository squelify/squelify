import type * as LabelPrimitive from '@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'
import { Controller, FormProvider, useFormContext } from 'react-hook-form'
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form'
import { Label } from '../label/label'
import { formStyles } from './form.css'
import type { FormVariants } from './form.css'

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement>, FormVariants {}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, size, ...props }, ref) => {
    const id = React.useId()
    const styles = formStyles({ size })

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={styles.item({ className })} {...props} />
      </FormItemContext.Provider>
    )
  }
)

const FormLabel = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error } = useFormField()
  const styles = formStyles({ error: !!error })

  return <Label ref={ref} className={styles.label({ className })} {...props} />
})

const FormControl = React.forwardRef<
  React.ComponentRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot> & FormVariants
>(({ size, ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
  const styles = formStyles({ error: !!error, size })

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      className={styles.control()}
      {...props}
    />
  )
})

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()
  const styles = formStyles()

  return (
    <p ref={ref} id={formDescriptionId} className={styles.description({ className })} {...props} />
  )
})

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const styles = formStyles()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p ref={ref} id={formMessageId} className={styles.message({ className })} {...props}>
      {body}
    </p>
  )
})

FormItem.displayName = 'FormItem'
FormLabel.displayName = 'FormLabel'
FormControl.displayName = 'FormControl'
FormDescription.displayName = 'FormDescription'
FormMessage.displayName = 'FormMessage'

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
