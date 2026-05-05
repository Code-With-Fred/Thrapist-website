'use client';

import { useId } from 'react';
import * as RadixSlider from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  formatValue?: (value: number) => string;
  disabled?: boolean;
  className?: string;
}

function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  formatValue,
  disabled,
  className,
}: SliderProps) {
  const id = useId();
  const displayValue = formatValue ? formatValue(value) : String(value);

  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="text-sm font-medium text-slate-700"
          >
            {label}
          </label>
          <span className="text-sm font-semibold text-teal-700 tabular-nums">
            {displayValue}
          </span>
        </div>
      )}

      <RadixSlider.Root
        id={id}
        value={[value]}
        onValueChange={([val]) => onChange(val)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        aria-label={label}
      >
        <RadixSlider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-200">
          <RadixSlider.Range className="absolute h-full bg-teal-500 rounded-full" />
        </RadixSlider.Track>

        <RadixSlider.Thumb
          className={cn(
            'block h-5 w-5 rounded-full border-2 border-teal-600 bg-white shadow-md',
            'transition-colors focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-teal-500 focus-visible:ring-offset-2',
            'disabled:pointer-events-none',
            'hover:border-teal-700 hover:shadow-lg',
          )}
          aria-label={label}
        />
      </RadixSlider.Root>

      <div className="flex justify-between text-xs text-slate-400 select-none">
        <span>{formatValue ? formatValue(min) : min}</span>
        <span>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  );
}

export { Slider };
export type { SliderProps };
