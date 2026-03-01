import React from 'react';
import { cn } from '@/src/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mzansi-green focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-mzansi-red focus:ring-mzansi-red",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-mzansi-red">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
