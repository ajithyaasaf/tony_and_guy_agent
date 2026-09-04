'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles: luxury ergonomics, crisp typography, smooth micro-animation
    const baseClasses =
      'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-red/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] select-none';

    // Variant mappings
    const variantClasses = {
      primary:
        'bg-brand-red text-brand-white hover:bg-brand-red-hover shadow-md shadow-brand-red/20',
      secondary:
        'bg-brand-black text-brand-white hover:bg-brand-dark shadow-sm',
      outline:
        'bg-brand-white border border-brand-border text-brand-black hover:border-brand-black hover:bg-brand-subtle',
      subtle:
        'bg-brand-subtle text-brand-black hover:bg-brand-surface border border-brand-border/60',
      ghost:
        'bg-transparent text-brand-black hover:bg-brand-subtle',
    }[variant];

    // Size mappings (minimum touch target 40px - 48px)
    const sizeClasses = {
      sm: 'text-[11px] px-3.5 py-1.5 rounded-full min-h-[36px] gap-1.5',
      md: 'text-xs px-5 py-2.5 rounded-full min-h-[44px] gap-2',
      lg: 'text-sm px-7 py-3.5 rounded-full min-h-[50px] gap-2.5',
    }[size];

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
