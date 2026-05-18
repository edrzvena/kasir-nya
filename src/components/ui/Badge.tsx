import type { ReactNode, HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: ReactNode;
}

export default function Badge({
  variant = 'neutral',
  children,
  className = '',
  ...props
}: BadgeProps) {
  
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border shrink-0';

  const variantClasses = {
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100/50 shadow-sm shadow-emerald-50/20',
    warning: 'bg-amber-50 text-amber-600 border-amber-100/50 shadow-sm shadow-amber-50/20',
    danger: 'bg-rose-50 text-rose-600 border-rose-100/50 shadow-sm shadow-rose-50/20',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-100/50 shadow-sm shadow-indigo-50/20',
    neutral: 'bg-slate-50 text-slate-500 border-slate-100'
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
