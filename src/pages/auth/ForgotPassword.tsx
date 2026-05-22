import { useState, type FormEvent } from 'react';
import { Mail, AlertCircle, CheckCircle2, Sparkles, ArrowLeft } from 'lucide-react';
import { authService } from '../../lib/db';

interface ForgotPasswordProps {
  onBack: () => void;
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await authService.resetPassword(email);
      setSuccessMsg('Link reset kata sandi sudah dikirim! Cek inbox email kamu.');
      setEmail('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">

      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={onBack}
          className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm">Pulihkan Kata Sandi</h3>
          <p className="text-[10px] text-slate-400 font-medium">Kami akan kirim link reset kata sandi ke email kamu.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3 text-xs text-emerald-700 font-bold animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 text-xs text-rose-700 font-bold animate-fadeIn">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">
          Alamat Email
        </label>
        <div className="relative">
          <input
            type="email"
            required
            placeholder="contoh: manager@toko.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 border border-slate-150 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-805 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 transition-all font-semibold"
          />
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-xs cursor-pointer shadow-md shadow-indigo-200 flex items-center justify-center gap-2 mt-6 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
      >
        {loading
          ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><Sparkles className="h-4 w-4" /><span>Kirim Link Reset</span></>
        }
      </button>
    </form>
  );
}
