import React from 'react';
import { cn } from '@/src/utils/cn';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-2xl border border-gray-800 bg-gray-900 text-white shadow-sm", className)} {...props} />
  )
);
Card.displayName = "Card";
