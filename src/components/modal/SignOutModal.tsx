import { LogOut } from 'lucide-react';
import type { UserProfile } from '../../lib/db';

interface SignOutModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  currentUser: UserProfile;
  storeName?: string;
  avatarUrl?: string;
  isLoading?: boolean;
}

export default function SignOutModal({ isOpen, onCancel, onConfirm, currentUser, storeName, avatarUrl, isLoading }: SignOutModalProps) {
  if (!isOpen) return null;

  const displayName = currentUser.name || currentUser.email;
  const roleLabel = currentUser.role === 'admin' ? 'Admin' : 'Kasir';
  const storeLabel = storeName || 'Outlet kamu';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden z-10 animate-scaleUp">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-rose-400 to-pink-500" />

        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <LogOut className="h-6 w-6 text-rose-500" />
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-5">
            <h3 className="font-extrabold text-slate-800 text-lg mb-1">Keluar dari akun?</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Sesi kamu akan diakhiri dan kamu perlu login ulang untuk melanjutkan.
            </p>
          </div>

          {/* User info chip */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 mb-6">
            <div className="h-8 w-8 rounded-xl flex-shrink-0 overflow-hidden">
              {avatarUrl && currentUser.role === 'admin'
                ? <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                : <div className="h-full w-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-extrabold">{displayName.charAt(0).toUpperCase()}</div>
              }
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700 truncate">{displayName}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{roleLabel} · {storeLabel}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-200/60 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:scale-100"
            >
              {isLoading ? 'Keluar...' : 'Ya, Keluar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
