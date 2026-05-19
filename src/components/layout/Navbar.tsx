import { type UserProfile } from '../../lib/db';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  avatarUrl?: string;
}

export default function Navbar({ activeTab, setActiveTab, currentUser, avatarUrl = '' }: NavbarProps) {

  const isCashier = currentUser.role === 'cashier';

  const displayName = isCashier
    ? (currentUser.name || 'Kasir')
    : currentUser.email.split('@')[0].split(/[-_.]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

  const initials = displayName.charAt(0).toUpperCase();

  const roleName = isCashier ? 'POS Cashier' : 'Store Administrator';

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-10 shrink-0 shadow-sm">

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 capitalize tracking-wide">{activeTab} View</span>
      </div>

      <div className="flex items-center gap-5">
        <div
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          title="Lihat profil"
        >
          {/* Avatar: foto kalau ada, inisial kalau tidak */}
          <div className="h-10 w-10 rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex-shrink-0">
            {avatarUrl
              ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              )
              : (
                <div className="h-full w-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-sm">
                  {initials}
                </div>
              )
            }
          </div>

          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-slate-700 block leading-tight group-hover:text-indigo-600 transition-colors duration-200">
              {displayName}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 uppercase tracking-wide">
              {roleName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
