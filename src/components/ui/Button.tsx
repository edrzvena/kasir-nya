import type { ReactNode, ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  
  // Base classes for a premium fluid interaction feel
  const baseClasses = 'inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100';

  // Variant mappings
  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-155',
    secondary: 'border border-slate-150 text-slate-655 hover:bg-slate-50 shadow-xs',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-100',
    light: 'bg-slate-50 hover:bg-slate-100 text-slate-655 border border-slate-100',
    dark: 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm'
  };

  // Size padding mappings
  const sizeClasses = {
    sm: 'px-3 py-1.5 rounded-lg text-[10px] gap-1.5',
    md: 'px-4.5 py-2.5 rounded-xl text-xs gap-2',
    lg: 'px-6 py-3.5 rounded-2xl text-sm gap-2.5'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`shrink-0 ${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />}
      <span>{children}</span>
    </button>
  );
}
