import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export default function Card({
  children,
  hoverable = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white border border-slate-100 rounded-3xl p-6 shadow-sm transition-all duration-300 ${
        hoverable 
          ? 'hover:border-indigo-100 hover:shadow-md hover:shadow-slate-100/50 hover:scale-[1.005]' 
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
