// TODO: refactor (https://github.com/huybuidac/shadcn-datetime-picker)

import * as Lucide from 'lucide-react'
import {
  DayPicker,
  type DayPickerDefaultProps,
  type DayPickerMultipleProps,
  type DayPickerRangeProps,
  type DayPickerSingleProps,
} from 'react-day-picker'
import { clx } from '#/utils/helper'
import { calendarStyles } from './calendar.css'

export type CalendarProps =
  | DayPickerDefaultProps
  | DayPickerSingleProps
  | DayPickerRangeProps
  | DayPickerMultipleProps

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const styles = calendarStyles()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={clx(styles.base(), className)}
      classNames={{
        months: styles.months(),
        month: styles.month(),
        caption: styles.caption(),
        caption_label: styles.caption_label(),
        nav: styles.nav(),
        nav_button: styles.nav_button(),
        nav_button_previous: styles.nav_button_previous(),
        nav_button_next: styles.nav_button_next(),
        table: styles.table(),
        head_row: styles.head_row(),
        head_cell: styles.head_cell(),
        row: styles.row(),
        cell: clx(
          styles.cell(),
          props.mode === 'range' ? styles.cell_range() : styles.cell_single()
        ),
        day: styles.day(),
        day_range_start: styles.day_range_start(),
        day_range_end: styles.day_range_end(),
        day_selected: styles.day_selected(),
        day_today: styles.day_today(),
        day_outside: styles.day_outside(),
        day_disabled: styles.day_disabled(),
        day_range_middle: styles.day_range_middle(),
        day_hidden: styles.day_hidden(),
        ...classNames,
      }}
      components={{
        IconLeft: ({ className }) => (
          <Lucide.ChevronLeft className={clx(styles.icon(), className)} />
        ),
        IconRight: ({ className }) => (
          <Lucide.ChevronRight className={clx(styles.icon(), className)} />
        ),
      }}
      {...props}
    />
  )
}

Calendar.displayName = 'Calendar'

export { Calendar }
