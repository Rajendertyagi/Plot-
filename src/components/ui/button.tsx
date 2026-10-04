import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-indigo-600 text-white shadow hover:bg-indigo-500 active:bg-indigo-700',
        destructive: 'bg-rose-600 text-white shadow-sm hover:bg-rose-500 active:bg-rose-700',
        outline: 'border border-neutral-700 bg-neutral-900/50 text-neutral-200 hover:bg-neutral-800 hover:text-white',
        secondary: 'bg-neutral-800 text-neutral-200 shadow-sm hover:bg-neutral-700 hover:text-white',
        ghost: 'text-neutral-400 hover:bg-neutral-800/80 hover:text-neutral-100',
        link: 'text-indigo-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-8 px-3 py-1.5',
        sm: 'h-7 rounded px-2.5 text-[11px]',
        lg: 'h-9 rounded-md px-4 text-sm',
        icon: 'h-8 w-8',
        'icon-sm': 'h-7 w-7 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
