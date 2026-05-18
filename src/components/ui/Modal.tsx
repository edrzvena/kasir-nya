import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'sm'
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
      {/* Click-out backdrop binder */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal Dialog Content Container */}
      <div className={`bg-white rounded-3xl w-full shadow-2xl p-6 relative border border-slate-50 z-10 animate-scaleUp ${maxWidthClasses[maxWidth]}`}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 h-8 w-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer transition-colors active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Block */}
        <h3 className="font-extrabold text-slate-805 text-lg mb-1 leading-snug pr-8">{title}</h3>
        {description && (
          <p className="text-slate-400 text-xs mb-5 font-semibold leading-relaxed">{description}</p>
        )}

        {/* Children Render Slot */}
        <div className="mt-1">
          {children}
        </div>
      </div>
    </div>
  );
}
