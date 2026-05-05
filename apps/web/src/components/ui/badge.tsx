import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'outline';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    'bg-slate-100 text-slate-700 border-transparent',
  primary:
    'bg-teal-100 text-teal-800 border-transparent',
  secondary:
    'bg-purple-100 text-purple-800 border-transparent',
  success:
    'bg-green-100 text-green-800 border-transparent',
  warning:
    'bg-amber-100 text-amber-800 border-transparent',
  danger:
    'bg-red-100 text-red-800 border-transparent',
  outline:
    'bg-transparent text-slate-700 border-slate-300',
};

function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
