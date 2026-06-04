'use client';

import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from './calendar';

interface DateRange {
  start: Date;
  end: Date;
}

interface DatePickerWithRangeProps {
  selectedRange: DateRange;
  onChange: (range: DateRange) => void;
}

export default function DatePickerWithRange({
  selectedRange,
  onChange
}: DatePickerWithRangeProps) {
  const formatDateRange = (range: DateRange) => {
    const startStr = range.start.toLocaleDateString('pt-BR');
    const endStr = range.end.toLocaleDateString('pt-BR');
    if (startStr === endStr) {
      return startStr;
    }
    return `${startStr} - ${endStr}`;
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-900 rounded-xl px-4 py-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 shadow-sm transition-all focus:outline-none cursor-pointer">
          <CalendarIcon className="w-3.5 h-3.5 text-zinc-500" />
          <span className="font-semibold">{formatDateRange(selectedRange)}</span>
        </button>
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Content 
          align="end" 
          sideOffset={8} 
          className="z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-850 shadow-2xl rounded-3xl p-5 w-[330px] animate-in fade-in zoom-in-95 duration-200 focus:outline-none"
        >
          <Calendar
            mode="range"
            defaultMonth={selectedRange.start}
            selected={{
              from: selectedRange.start,
              to: selectedRange.end
            }}
            onSelect={(range) => {
              if (range?.from) {
                onChange({
                  start: range.from,
                  end: range.to || range.from
                });
              }
            }}
            numberOfMonths={1}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
