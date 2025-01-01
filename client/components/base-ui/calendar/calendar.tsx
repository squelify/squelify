import * as Lucide from 'lucide-react'
import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { clx } from '#/utils/helper'
import { buttonStyles } from '../button/button.css'
import { calendarStyles } from './calendar.css'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={clx(calendarStyles(), className)}
      classNames={{
        months: calendarStyles({ layout: 'months' }),
        month: calendarStyles({ layout: 'month' }),
        caption: calendarStyles({ layout: 'caption' }),
        caption_label: calendarStyles({ layout: 'caption_label' }),
        nav: calendarStyles({ layout: 'nav' }),
        nav_button: clx(
          buttonStyles({ variant: 'outline' }),
          calendarStyles({ layout: 'nav_button' })
        ),
        nav_button_previous: calendarStyles({ layout: 'nav_button_previous' }),
        nav_button_next: calendarStyles({ layout: 'nav_button_next' }),
        table: calendarStyles({ layout: 'table' }),
        head_row: calendarStyles({ layout: 'head_row' }),
        head_cell: calendarStyles({ layout: 'head_cell' }),
        row: calendarStyles({ layout: 'row' }),
        cell: clx(
          calendarStyles({ layout: 'cell' }),
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md'
        ),
        day: clx(buttonStyles({ variant: 'ghost' }), calendarStyles({ layout: 'day' })),
        day_range_start: calendarStyles({ layout: 'day_range_start' }),
        day_range_end: calendarStyles({ layout: 'day_range_end' }),
        day_selected: calendarStyles({ layout: 'day_selected' }),
        day_today: calendarStyles({ layout: 'day_today' }),
        day_outside: calendarStyles({ layout: 'day_outside' }),
        day_disabled: calendarStyles({ layout: 'day_disabled' }),
        day_range_middle: calendarStyles({ layout: 'day_range_middle' }),
        day_hidden: calendarStyles({ layout: 'day_hidden' }),
        ...classNames,
      }}
      components={{
        IconLeft: ({ className }) => <Lucide.ChevronLeft className={clx('size-4', className)} />,
        IconRight: ({ className }) => <Lucide.ChevronRight className={clx('size-4', className)} />,
      }}
      {...props}
    />
  )
}

Calendar.displayName = 'Calendar'

export { Calendar }
