import React from 'react';
import { cn } from '@/src/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            'bg-mzansi-green text-white hover:bg-mzansi-green/90': variant === 'primary',
            'bg-mzansi-yellow text-mzansi-black hover:bg-mzansi-yellow/90': variant === 'secondary',
            'border-2 border-mzansi-green text-mzansi-green hover:bg-mzansi-green/10': variant === 'outline',
            'hover:bg-gray-800 text-gray-300': variant === 'ghost',
            'bg-mzansi-red text-white hover:bg-mzansi-red/90': variant === 'danger',
            'h-9 px-4 text-sm': size === 'sm',
            'h-12 px-6 text-base': size === 'md',
            'h-14 px-8 text-lg': size === 'lg',
            'w-full': fullWidth,
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
