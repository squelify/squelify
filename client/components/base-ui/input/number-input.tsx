import * as Lucide from 'lucide-react'
import * as React from 'react'
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import useDebounce from '#/context/hooks/use-debounce'
import { clx } from '#/utils/helper'
import { Button } from '../button/button'
import { inputStyles } from './input.css'

export interface NumberInputProps extends Omit<NumericFormatProps, 'value' | 'onValueChange'> {
  stepper?: number
  thousandSeparator?: string
  placeholder?: string
  defaultValue?: number
  min?: number
  max?: number
  value?: number // Controlled value
  suffix?: string
  prefix?: string
  onValueChange?: (value: number | undefined) => void
  fixedDecimalScale?: boolean
  decimalScale?: number
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      stepper,
      placeholder,
      defaultValue,
      thousandSeparator,
      min = Number.NEGATIVE_INFINITY,
      max = Number.POSITIVE_INFINITY,
      fixedDecimalScale = false,
      value: controlledValue,
      decimalScale = 0,
      suffix,
      prefix,
      className,
      onValueChange,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState<number | undefined>(controlledValue ?? defaultValue)
    const debouncedValue = useDebounce(value, 300)
    const styles = inputStyles()

    const handleIncrement = React.useCallback(() => {
      setValue((prev) =>
        prev === undefined ? (stepper ?? 1) : Math.min(prev + (stepper ?? 1), max)
      )
    }, [stepper, max])

    const handleDecrement = React.useCallback(() => {
      setValue((prev) =>
        prev === undefined ? -(stepper ?? 1) : Math.max(prev - (stepper ?? 1), min)
      )
    }, [stepper, min])

    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (document.activeElement === (ref as React.RefObject<HTMLInputElement>).current) {
          if (e.key === 'ArrowUp') {
            handleIncrement()
          } else if (e.key === 'ArrowDown') {
            handleDecrement()
          }
        }
      }

      window.addEventListener('keydown', handleKeyDown)

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }, [handleIncrement, handleDecrement, ref])

    React.useEffect(() => {
      if (controlledValue !== undefined) {
        setValue(controlledValue)
      }
      if (onValueChange) {
        onValueChange(debouncedValue)
      }
    }, [controlledValue, debouncedValue, onValueChange])

    const handleChange = (values: { value: string; floatValue: number | undefined }) => {
      const newValue = values.floatValue === undefined ? undefined : values.floatValue
      setValue(newValue)
    }

    const handleBlur = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        if (value !== undefined) {
          let newValue = value

          if (value < min) {
            newValue = min
          } else if (value > max) {
            newValue = max
          }

          // Update value jika berbeda
          if (newValue !== value) {
            setValue(newValue)
            if (onValueChange) {
              onValueChange(newValue)
            }
          }
        }

        // Forward blur event ke props.onBlur jika ada
        if (props.onBlur) {
          props.onBlur(event)
        }
      },
      [value, min, max, onValueChange, props.onBlur]
    )

    return (
      <div className="relative">
        <NumericFormat
          value={value}
          onValueChange={handleChange}
          thousandSeparator={thousandSeparator}
          decimalScale={decimalScale}
          fixedDecimalScale={fixedDecimalScale}
          allowNegative={min < 0}
          valueIsNumericString
          onBlur={handleBlur}
          max={max}
          min={min}
          suffix={suffix}
          prefix={prefix}
          placeholder={placeholder}
          className={styles.numberInput({ className })}
          getInputRef={ref}
          {...props}
        />

        <div className="absolute top-0 right-0 flex flex-col">
          <Button
            variant="outline"
            aria-label="Increase value"
            className="h-4 rounded-l-none rounded-br-none px-2 focus-visible:relative"
            onClick={handleIncrement}
            disabled={value === max}
          >
            <Lucide.ChevronUp className="size-4" strokeWidth={2} />
          </Button>
          <Button
            variant="outline"
            aria-label="Decrease value"
            className="h-4 rounded-l-none rounded-tr-none px-2 focus-visible:relative"
            onClick={handleDecrement}
            disabled={value === min}
          >
            <Lucide.ChevronDown className="size-4" strokeWidth={2} />
          </Button>
        </div>
      </div>
    )
  }
)
