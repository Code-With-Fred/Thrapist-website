'use client';

import { KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

type RatingSize = 'sm' | 'md' | 'lg';

interface RatingProps {
  value: number;
  size?: RatingSize;
  showValue?: boolean;
  onChange?: (value: number) => void;
  className?: string;
  max?: number;
}

const starSizeClasses: Record<RatingSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

const valueSizeClasses: Record<RatingSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

interface StarProps {
  filled: number; // 0 = empty, 0.5 = half, 1 = full
  size: RatingSize;
  index: number;
  interactive: boolean;
  onSelect?: (value: number) => void;
}

function Star({ filled, size, index, interactive, onSelect }: StarProps) {
  const starId = `star-${index}`;
  const gradientId = `half-${index}`;

  const handleClick = () => {
    if (interactive && onSelect) {
      onSelect(index + 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && interactive && onSelect) {
      e.preventDefault();
      onSelect(index + 1);
    }
  };

  const starEl = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn(
        starSizeClasses[size],
        'transition-colors',
        filled === 1
          ? 'text-amber-400'
          : filled === 0.5
          ? 'text-amber-400'
          : 'text-slate-200',
      )}
      aria-hidden="true"
    >
      {filled === 0.5 && (
        <defs>
          <linearGradient id={gradientId}>
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
      )}
      <path
        fill={filled === 0.5 ? `url(#${gradientId})` : 'currentColor'}
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  );

  if (interactive) {
    return (
      <button
        type="button"
        id={starId}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Rate ${index + 1} out of 5`}
        className={cn(
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm',
          'hover:scale-110 transition-transform',
        )}
      >
        {starEl}
      </button>
    );
  }

  return starEl;
}

function Rating({
  value,
  size = 'md',
  showValue = false,
  onChange,
  className,
  max = 5,
}: RatingProps) {
  const interactive = Boolean(onChange);
  const clamped = Math.min(Math.max(value, 0), max);

  const stars = Array.from({ length: max }, (_, i) => {
    const position = i + 1;
    let filled: 0 | 0.5 | 1 = 0;
    if (clamped >= position) {
      filled = 1;
    } else if (clamped >= position - 0.5) {
      filled = 0.5;
    }
    return filled;
  });

  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      role={interactive ? 'group' : 'img'}
      aria-label={
        interactive
          ? `Rating: ${clamped} out of ${max}`
          : `Rated ${clamped} out of ${max} stars`
      }
    >
      <div className="flex items-center gap-0.5">
        {stars.map((filled, i) => (
          <Star
            key={i}
            filled={filled}
            size={size}
            index={i}
            interactive={interactive}
            onSelect={onChange}
          />
        ))}
      </div>

      {showValue && (
        <span
          className={cn(
            'font-semibold text-slate-700 tabular-nums ml-1',
            valueSizeClasses[size],
          )}
          aria-hidden="true"
        >
          {clamped % 1 === 0 ? clamped.toFixed(0) : clamped.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export { Rating };
export type { RatingProps, RatingSize };
