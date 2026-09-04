'use client';

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'red' | 'redSubtle' | 'green' | 'amber' | 'dark' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  icon,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center font-extrabold uppercase tracking-wider rounded-full shrink-0 select-none';

  const variantClasses = {
    red: 'bg-brand-red text-brand-white',
    redSubtle: 'bg-brand-red-subtle text-brand-red border border-brand-red/20',
    green: 'bg-brand-green-subtle text-brand-green border border-brand-green/20',
    amber: 'bg-brand-amber-subtle text-brand-amber border border-brand-amber/20',
    dark: 'bg-brand-dark text-brand-white border border-neutral-800',
    neutral: 'bg-brand-subtle text-brand-muted border border-brand-border',
  }[variant];

  const sizeClasses = {
    sm: 'text-[9px] sm:text-[10px] px-2 py-0.5 gap-1',
    md: 'text-[10px] sm:text-xs px-2.5 py-1 gap-1.5',
  }[size];

  const dotColorClasses = {
    red: 'bg-brand-white',
    redSubtle: 'bg-brand-red',
    green: 'bg-brand-green animate-pulse',
    amber: 'bg-brand-amber',
    dark: 'bg-emerald-400 animate-pulse',
    neutral: 'bg-brand-muted',
  }[variant];

  return (
    <span className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`} {...props}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColorClasses} shrink-0`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
