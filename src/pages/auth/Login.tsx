import { useState, type FormEvent } from 'react';
import { Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import KasirIcon from '../../components/ui/KasirIcon';
import { authService, type UserProfile } from '../../lib/db';
import ForgotPassword from './ForgotPassword';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      const user = await authService.signIn(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat login.');
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
          <h2 className="text-2xl font-extrabold text-slate-800 leading-tight">Kasirnya POS Console</h2>
          <span className="text-[10px] text-slate-400 font-bold block mt-1.5 uppercase tracking-wider">
            Multi-Tenant SaaS Retail Suite
          </span>
        </div>

        {showForgot ? (
          <ForgotPassword onBack={() => setShowForgot(false)} />
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">

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

              <div>
                <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {loading
                  ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Sparkles className="h-4 w-4" /><span>Masuk</span></>
                }
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                Lupa kata sandi?
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-500 font-semibold">
                Belum punya akun?{' '}
                <a
                  href="https://wa.me/6281384437767"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
                >
                  Hubungi kami
                </a>
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
