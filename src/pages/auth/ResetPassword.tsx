import { useState, type FormEvent } from 'react';
import { Lock, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import KasirIcon from '../../components/ui/KasirIcon';
import { authService } from '../../lib/db';

interface ResetPasswordProps {
  onSuccess: () => void;
}

export default function ResetPassword({ onSuccess }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await authService.updatePassword(password);
      setSuccessMsg('Your password has been successfully updated! You can now log in.');
      
      // Clean URL hash so it doesn't trigger recovery session again
      window.location.hash = '';

      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Premium Neon Radial Backdrops */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Panel Container */}
      <div className="w-full max-w-md bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Upper Branding Header */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20 relative group">
            <KasirIcon className="h-7 w-7 group-hover:scale-105 transition-transform" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-indigo-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-white leading-tight">Create New Password</h2>
          <span className="text-xs text-slate-400 font-semibold block mt-1.5 uppercase tracking-wider">
            Secure Account Recovery Console
          </span>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3 mb-6 text-xs text-emerald-300 font-semibold animate-fadeIn text-left">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Validation Errors Box */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-start gap-3 mb-6 text-xs text-rose-300 font-semibold animate-fadeIn text-left">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          <div>
            <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">New Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/45 border border-slate-700/60 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all font-semibold"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950/45 border border-slate-700/60 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all font-semibold"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-xs cursor-pointer shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 pt-3 pb-3 mt-6 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Save New Password</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
