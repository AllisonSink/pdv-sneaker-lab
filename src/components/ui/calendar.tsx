'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={className}
      classNames={{
        root: 'p-3',
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        month_caption: 'flex justify-between pt-1 relative items-center px-8',
        caption_label: 'text-sm font-bold text-zinc-850 dark:text-zinc-100',
        nav: 'space-x-1 flex items-center',
        button_previous: 'absolute left-1 h-8 w-8 bg-transparent p-0 opacity-55 hover:opacity-100 rounded-xl border border-zinc-200 dark:border-zinc-850 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer',
        button_next: 'absolute right-1 h-8 w-8 bg-transparent p-0 opacity-55 hover:opacity-100 rounded-xl border border-zinc-200 dark:border-zinc-850 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer',
        chevron: 'h-4 w-4 text-zinc-650 dark:text-zinc-400',
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'text-zinc-400 dark:text-zinc-550 rounded-md w-10 font-bold text-[10px] uppercase tracking-wider text-center py-1.5',
        weeks: 'space-y-1.5',
        week: 'flex w-full mt-1.5',
        day: 'h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].range_end)]:rounded-r-xl [&:has([aria-selected].outside)]:bg-zinc-100/50 [&:has([aria-selected])]:bg-zinc-100 dark:[&:has([aria-selected])]:bg-zinc-900 first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl focus-within:relative focus-within:z-20 flex items-center justify-center',
        day_button: 'h-10 w-10 p-0 font-normal rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-850 dark:text-zinc-250 transition-colors cursor-pointer flex items-center justify-center',
        range_end: 'range_end rounded-r-xl',
        range_start: 'range_start rounded-l-xl',
        selected: 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-50 dark:hover:text-zinc-950 focus:bg-zinc-900 focus:text-white dark:focus:bg-zinc-50 dark:focus:text-zinc-950 font-bold shadow-md',
        today: 'border border-zinc-300 dark:border-zinc-700 font-semibold',
        outside: 'text-zinc-400 dark:text-zinc-650 opacity-40',
        disabled: 'text-zinc-400 dark:text-zinc-650 opacity-40 pointer-events-none',
        range_middle: 'aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-900 aria-selected:text-zinc-900 dark:aria-selected:text-zinc-100 rounded-none',
        hidden: 'invisible',
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
