import { useState } from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Package,
  BarChart3,
  User,
  HelpCircle,
  LogOut,
  UserPlus,
  ShoppingCart,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { authService, type UserProfile } from '../../lib/db';
import SignOutModal from '../modal/SignOutModal';
import KasirIcon from '../ui/KasirIcon';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  onLogout: () => void;
  storeName?: string;
  avatarUrl?: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  storeName,
  avatarUrl,
  collapsed,
  onToggleCollapsed
}: SidebarProps) {
  const [showSignOut, setShowSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await authService.signOut();
    onLogout();
  };

  const getMenuItems = () => {
    if (currentUser.role === 'cashier') {
      return [
        { id: 'pos', name: 'POS Cashier', icon: ShoppingCart },
        { id: 'invoices', name: 'Invoices', icon: ReceiptText },
        { id: 'profile', name: 'Profile', icon: User },
      ];
    }
    return [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
      { id: 'pos', name: 'POS Cashier', icon: ShoppingCart },
      { id: 'invoices', name: 'Invoices', icon: ReceiptText },
      { id: 'catalog', name: 'Catalog', icon: Package },
      { id: 'sales', name: 'Sales Performance', icon: BarChart3 },
      { id: 'staff', name: 'Manage Staff', icon: UserPlus },
      { id: 'profile', name: 'Profile', icon: User },
    ];
  };

  const menuItems = getMenuItems();

  const labelTransition = 'transition-[opacity,max-width] duration-300 ease-out whitespace-nowrap overflow-hidden';
  const labelState = collapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-[200px]';

  return (
    <aside className={`${collapsed ? 'w-[5.5rem]' : 'w-64'} bg-white border-r border-slate-100/80 flex flex-col h-screen fixed left-0 top-0 z-20 transition-[width] duration-300 ease-out`}>

      <button
        onClick={onToggleCollapsed}
        title={collapsed ? 'Perbesar sidebar' : 'Perkecil sidebar'}
        className="absolute -right-3 top-9 h-6 w-6 bg-white border border-slate-150 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 shadow-sm cursor-pointer z-30 transition-colors"
      >
        {collapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
      </button>

      <div className="p-6 border-b border-slate-100/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200/60 shrink-0">
            <KasirIcon className="h-5 w-5" />
          </div>
          <div className={`${labelTransition} ${labelState}`}>
            <h1 className="font-extrabold text-slate-800 text-base leading-tight tracking-tight">Kasirnya</h1>
            <span className="text-[10px] font-semibold text-slate-400 block tracking-wider uppercase mt-0.5">POS Command Center</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.name : undefined}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 group ${isActive
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-300/30'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white/90' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className={`flex-1 text-left text-sm ${labelTransition} ${labelState}`}>{item.name}</span>
              <div className={`h-1.5 w-1.5 bg-white/60 rounded-full shrink-0 transition-opacity duration-200 ${isActive && !collapsed ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-50 space-y-1">
        <button
          onClick={() => setActiveTab('help')}
          title={collapsed ? 'Help Center' : undefined}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
          <span className={`${labelTransition} ${labelState}`}>Help Center</span>
        </button>

        <button
          onClick={() => setShowSignOut(true)}
          title={collapsed ? 'Sign Out' : undefined}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-50/50 cursor-pointer transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className={`${labelTransition} ${labelState}`}>Sign Out</span>
        </button>
      </div>

      {showSignOut && (
        <SignOutModal
          isOpen={showSignOut}
          onCancel={() => setShowSignOut(false)}
          onConfirm={handleSignOut}
          currentUser={currentUser}
          storeName={storeName}
          avatarUrl={avatarUrl}
          isLoading={signingOut}
        />
      )}
    </aside>
  );
}
