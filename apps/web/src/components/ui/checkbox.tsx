'use client';

import { useId } from 'react';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3 w-3"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="2 6 5 9 10 3" />
    </svg>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
  id: propId,
}: CheckboxProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;
  const descId = `${id}-desc`;

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <RadixCheckbox.Root
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-describedby={description ? descId : undefined}
        className={cn(
          'peer mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded',
          'border-2 border-slate-300 bg-white',
          'transition-colors focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-teal-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600',
          'data-[state=checked]:text-white',
          'hover:border-teal-500',
        )}
      >
        <RadixCheckbox.Indicator className="text-current">
          <CheckIcon />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>

      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                'text-sm font-medium text-slate-700 cursor-pointer leading-5',
                disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p id={descId} className="text-xs text-slate-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export { Checkbox };
export type { CheckboxProps };
