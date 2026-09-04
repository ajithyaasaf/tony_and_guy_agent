'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'dark' | 'interactive' | 'highlight';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverLift?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      hoverLift = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'rounded-2xl border transition-all duration-200 overflow-hidden';

    const variantClasses = {
      default: 'bg-brand-white border-brand-border shadow-xs text-brand-black',
      subtle: 'bg-brand-subtle border-brand-border/80 text-brand-black',
      dark: 'bg-brand-dark border-neutral-800 text-brand-white shadow-md',
      interactive:
        'bg-brand-white border-brand-border text-brand-black hover:border-brand-black hover:shadow-md cursor-pointer active:scale-[0.99]',
      highlight:
        'bg-brand-red-subtle border-brand-red/30 text-brand-black shadow-xs',
    }[variant];

    const paddingClasses = {
      none: '',
      sm: 'p-3 sm:p-4',
      md: 'p-4 sm:p-6',
      lg: 'p-6 sm:p-8',
    }[padding];

    const liftClass = hoverLift ? 'hover:-translate-y-0.5 hover:shadow-md' : '';

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${paddingClasses} ${liftClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
