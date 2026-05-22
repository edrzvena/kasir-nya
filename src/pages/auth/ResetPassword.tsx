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
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Kata sandi tidak cocok.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await authService.updatePassword(password);
      setSuccessMsg('Kata sandi berhasil diperbarui! Silakan login ulang.');

      window.location.hash = '';

      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 flex items-center justify-center p-6 relative overflow-hidden font-sans">

      <div className="absolute top-1/4 left-1/4 h-[420px] w-[420px] bg-indigo-200/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[360px] w-[360px] bg-violet-200/30 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/50 relative z-10">

        <div className="text-center mb-8">
          <div className="h-14 w-14 bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <KasirIcon className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 leading-tight">Buat Kata Sandi Baru</h2>
          <span className="text-[10px] text-slate-400 font-bold block mt-1.5 uppercase tracking-wider">
            Pemulihan Akun Aman
          </span>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3 mb-6 text-xs text-emerald-700 font-bold animate-fadeIn text-left">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 mb-6 text-xs text-rose-700 font-bold animate-fadeIn text-left">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">

          <div>
            <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Kata Sandi Baru</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-805 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all font-semibold"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Konfirmasi Kata Sandi</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-805 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all font-semibold"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-xs cursor-pointer shadow-md shadow-indigo-200 flex items-center justify-center gap-2 mt-6 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Simpan Kata Sandi Baru</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
