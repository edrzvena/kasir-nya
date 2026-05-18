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
  ShoppingCart
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
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  storeName,
  avatarUrl
}: SidebarProps) {
  const [showSignOut, setShowSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await authService.signOut();
    onLogout();
  };

  // Filter menu choices strictly by User Role
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

  return (
    <aside className="w-64 bg-white border-r border-slate-100/80 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Brand */}
      <div className="p-6 border-b border-slate-100/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200/60">
            <KasirIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 text-base leading-tight tracking-tight">Kasirnya</h1>
            <span className="text-[10px] font-semibold text-slate-400 block tracking-wider uppercase mt-0.5">POS Command Center</span>
          </div>
        </div>

        {/* Tenant Isolation Label */}
        <div className="mt-4 flex flex-col gap-1.5 bg-slate-50/80 border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Outlet</span>
            <span className="font-bold text-slate-700 font-mono text-xs">{currentUser.store_id}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Role</span>
            <span className="font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-mono">
              {currentUser.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${isActive
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-300/30'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
            >
              <Icon className={`h-4 w-4 transition-transform duration-200 ${isActive ? 'text-white/90' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
              <span className="flex-1 text-left text-sm">{item.name}</span>
              {isActive && (
                <div className="h-1.5 w-1.5 bg-white/60 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer */}
      <div className="p-4 border-t border-slate-50 space-y-1">
        <button
          onClick={() => setActiveTab('help')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <HelpCircle className="h-4 w-4 text-slate-400" />
          <span>Help Center</span>
        </button>

        <button
          onClick={() => setShowSignOut(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-50/50 cursor-pointer transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
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
