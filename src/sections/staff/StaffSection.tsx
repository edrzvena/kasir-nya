import { useState, useEffect, type FormEvent } from 'react';
import { Users, Plus, ShieldCheck, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../../lib/db';
import type { Cashier } from '../../lib/db';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';

interface StaffSectionProps {
  storeId: number;
  refreshTrigger: number;
}

export default function StaffSection({ storeId, refreshTrigger }: StaffSectionProps) {
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Form input fields
  const [cashierUsername, setCashierUsername] = useState('');
  const [cashierName, setCashierName] = useState('');
  const [cashierPin, setCashierPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [localTrigger, setLocalTrigger] = useState(0);

  // Fetch cashiers for this specific store
  useEffect(() => {
    const fetchCashiers = async () => {
      const list = await authService.getCashiers(storeId);
      setCashiers(list);
    };
    fetchCashiers();
  }, [storeId, refreshTrigger, localTrigger]);

  const handleRegisterCashier = async (e: FormEvent) => {
    e.preventDefault();
    if (!cashierUsername || !cashierName || !cashierPin) return;

    if (!/^[a-zA-Z0-9._-]+$/.test(cashierUsername)) {
      setErrorMsg('Username can only contain letters, numbers, dots, and hyphens.');
      return;
    }

    if (!/^\d{4,6}$/.test(cashierPin)) {
      setErrorMsg('PIN must be 4 to 6 numeric digits.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await authService.createCashier(cashierUsername, cashierName, cashierPin, storeId);
      setSuccessMsg(`Cashier "${cashierName}" registered successfully!`);
      
      // Reset inputs
      setCashierUsername('');
      setCashierName('');
      setCashierPin('');
      setLocalTrigger(prev => prev + 1);
      
      // Close modal after delay
      setTimeout(() => {
        setIsAddOpen(false);
        setSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create cashier account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-800 text-xl leading-none">Staff Management</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">Create and oversee cashier accounts assigned to this outlet.</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-indigo-650 hover:bg-indigo-755 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-md shadow-indigo-100 flex items-center gap-2 self-start transition-all hover:scale-102"
        >
          <Plus className="h-4 w-4" />
          <span>Register Cashier Account</span>
        </button>
      </div>

      {/* Cashier List Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cashiers.length === 0 ? (
          <div className="col-span-full bg-slate-50 border border-slate-100/80 rounded-3xl p-10 text-center space-y-3">
            <div className="h-12 w-12 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto shadow-sm">
              <Users className="h-5.5 w-5.5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm leading-none">No Cashier Accounts Configured</h4>
            <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
              Create secure cashier credentials. Cashiers can log in directly using only their Username and secure PIN.
            </p>
          </div>
        ) : (
          cashiers.map((cashier) => (
            <Card key={cashier.id} className="p-5 flex flex-col justify-between h-36 text-left">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                  {cashier.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-left overflow-hidden">
                  <h4 className="font-extrabold text-slate-800 text-sm truncate leading-snug" title={cashier.name}>
                    {cashier.name}
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-indigo-500 block tracking-normal mt-0.5">
                    @{cashier.username}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-3.5">
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Outlet ID: {storeId}</span>
                </div>
                
                <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-650 font-mono">
                  PIN: {cashier.pin}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Cashier Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setErrorMsg(null);
          setSuccessMsg(null);
        }}
        title="Register Cashier Profile"
        description="Creates secure, restricted POS credentials isolated under this store."
      >
        <form onSubmit={handleRegisterCashier} className="space-y-4 text-left">
          
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
            <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Cashier Username</label>
            <div className="relative">
              <input 
                type="text" 
                required
                placeholder="e.g. budi123, siti.pos"
                value={cashierUsername}
                onChange={(e) => setCashierUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl pl-11 pr-4 py-2.5 text-xs font-mono font-bold text-slate-805 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650"
              />
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            </div>
            <span className="text-[8px] text-slate-400 block mt-1.5 font-medium leading-normal">
              This serves as their unique login ID (letters, numbers, dots, and hyphens only).
            </span>
          </div>

          <div>
            <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Full Name</label>
            <div className="relative">
              <input 
                type="text" 
                required
                placeholder="e.g. Budi Luhur, Siti Aminah"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-slate-805 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650"
              />
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Cashier PIN (4-6 digits)</label>
            <div className="relative">
              <input 
                type="password" 
                required
                maxLength={6}
                placeholder="e.g. 1234"
                value={cashierPin}
                onChange={(e) => setCashierPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl pl-11 pr-4 py-2.5 text-xs font-mono font-bold tracking-widest text-slate-805 placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl mt-4 cursor-pointer shadow-md shadow-indigo-150 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Create Cashier Profile</span>
            )}
          </button>
        </form>
      </Modal>

    </div>
  );
}
