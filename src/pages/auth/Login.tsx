import { useState } from 'react';
import KasirIcon from '../../components/ui/KasirIcon';
import { type UserProfile } from '../../lib/db';
import AdminLogin from './AdminLogin';
import CashierLogin from './CashierLogin';
import Register from './Register';
import ForgotPassword from './ForgotPassword';

type AuthTab = 'admin' | 'cashier' | 'register' | 'forgot';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>('admin');

  return (
    <div className="min-h-screen bg-[#0a0c14] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Ambient glow backdrops */}
      <div className="absolute top-1/4 left-1/4 h-[480px] w-[480px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main panel */}
      <div className="w-full max-w-md bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40 relative z-10">

        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20 relative group">
            <KasirIcon className="h-7 w-7 group-hover:scale-105 transition-transform" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-indigo-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-white leading-tight">Kasirnya POS Console</h2>
          <span className="text-xs text-slate-400 font-semibold block mt-1.5 uppercase tracking-wider">
            Multi-Tenant SaaS Retail Suite
          </span>
        </div>

        {/* Tab Switcher — hidden on forgot password view */}
        {activeTab !== 'forgot' && (
          <div className="grid grid-cols-3 bg-black/30 border border-white/8 p-1 rounded-2xl mb-6 gap-1">
            {([
              { id: 'admin',    label: 'Admin Login' },
              { id: 'cashier',  label: 'Cashier PIN' },
              { id: 'register', label: 'Register'    },
            ] as const).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center leading-none ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Active View */}
        {activeTab === 'admin'    && <AdminLogin    onLoginSuccess={onLoginSuccess} onForgot={() => setActiveTab('forgot')} />}
        {activeTab === 'cashier'  && <CashierLogin  onLoginSuccess={onLoginSuccess} />}
        {activeTab === 'register' && <Register      onSuccess={() => setActiveTab('admin')} />}
        {activeTab === 'forgot'   && <ForgotPassword onBack={() => setActiveTab('admin')} />}

      </div>
    </div>
  );
}
