import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500',
  {
    variants: {
      variant: {
        default: 'border border-transparent bg-indigo-600/20 text-indigo-400',
        secondary: 'border border-neutral-800 bg-neutral-800/60 text-neutral-300',
        destructive: 'border border-transparent bg-rose-500/20 text-rose-400',
        outline: 'border border-neutral-700 text-neutral-400',
        success: 'border border-transparent bg-emerald-500/20 text-emerald-400',
        warning: 'border border-transparent bg-amber-500/20 text-amber-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
