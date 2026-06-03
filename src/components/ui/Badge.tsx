import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors';
  
  const variants = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50',
    info: 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50',
    neutral: 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], className))}>
      {children}
    </span>
  );
}