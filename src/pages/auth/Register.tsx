import { useState, type FormEvent } from 'react';
import { Mail, Lock, AlertCircle, CheckCircle2, Sparkles, Shield } from 'lucide-react';
import { authService } from '../../lib/db';

interface RegisterProps {
  onSuccess: () => void;
}

export default function Register({ onSuccess }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await authService.signUpAdmin(email, password);
      setSuccessMsg('Registration successful! We have sent a confirmation email. Please verify your email before logging in.');
      setEmail('');
      setPassword('');
      setTimeout(() => onSuccess(), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3 text-xs text-emerald-300 font-semibold animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-start gap-3 text-xs text-rose-300 font-semibold animate-fadeIn">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            required
            placeholder="e.g. manager@store.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950/45 border border-slate-700/60 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-550 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all font-sans font-semibold"
          />
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        </div>
      </div>

      <div>
        <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            type="password"
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950/45 border border-slate-700/60 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-550 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all font-sans font-semibold"
          />
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        </div>
      </div>

      <div className="bg-indigo-950/40 border border-indigo-900/30 p-3.5 rounded-2xl text-[10px] text-indigo-300 flex items-start gap-2.5 font-semibold">
        <Shield className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
        <span>
          **Onboarding Portal**: Standard registration assigns a default temporary store partition. Your platform administrator will manually allocate your specific outlet ID and store name.
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl text-xs cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 mt-6 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
      >
        {loading
          ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><Sparkles className="h-4 w-4" /><span>Create Admin Session</span></>
        }
      </button>
    </form>
  );
}
