import { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'size'> {
  src?: string;
  alt: string;
  size?: AvatarSize;
  fallback?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

const fallbackColors = [
  'bg-teal-500',
  'bg-purple-500',
  'bg-blue-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
];

function getColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return fallbackColors[Math.abs(hash) % fallbackColors.length];
}

function Avatar({
  src,
  alt,
  size = 'md',
  fallback,
  className,
  ...props
}: AvatarProps) {
  const colorClass = getColorFromString(alt || fallback || 'U');
  const initials = fallback ?? alt.slice(0, 2).toUpperCase();

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        sizeClasses[size],
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          {...props}
        />
      ) : (
        <span
          className={cn(
            'flex h-full w-full items-center justify-center rounded-full font-medium text-white select-none',
            colorClass,
          )}
          aria-label={alt}
        >
          {initials}
        </span>
      )}
    </span>
  );
}

export { Avatar };
export type { AvatarProps, AvatarSize };
