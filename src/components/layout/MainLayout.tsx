import { useState, useEffect, useMemo } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { authService, dbService, type UserProfile } from '../../lib/db';

import Dashboard from '../../pages/admin/Dashboard';
import Catalog from '../../pages/admin/Catalog';
import Sales from '../../pages/admin/Sales';
import Staff from '../../pages/admin/Staff';
import Profile from '../../pages/admin/Profile';
import POS from '../../pages/shared/POS';
import Invoices from '../../pages/shared/Invoices';
import Help from '../../pages/shared/Help';

interface MainLayoutProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

export default function MainLayout({ currentUser, onLogout }: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState<string>(
    currentUser.role === 'admin' ? 'dashboard' : 'pos'
  );

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(
    () => localStorage.getItem('kasirnya_sidebar_collapsed') === '1'
  );
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('kasirnya_sidebar_collapsed', next ? '1' : '0'); } catch {}
      return next;
    });
  };

  const [mountedTabs, setMountedTabs] = useState<Set<string>>(() => new Set([activeTab]));

  useEffect(() => {
    setMountedTabs(prev => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const [avatarUrl, setAvatarUrl] = useState<string>(
    () => localStorage.getItem(`kasirnya_avatar_${currentUser.store_id}`) ?? ''
  );
  const [storeName, setStoreName] = useState<string>('');

  useEffect(() => {
    authService.getStoreById(currentUser.store_id).then(store => {
      if (store?.avatar_url) {
        localStorage.setItem(`kasirnya_avatar_${currentUser.store_id}`, store.avatar_url);
        setAvatarUrl(store.avatar_url);
      }
      if (store?.name) setStoreName(store.name);
    }).catch(() => {});
  }, [currentUser.store_id]);

  useEffect(() => {
    Promise.all([
      dbService.getProducts(currentUser.store_id),
      dbService.getCategories(currentUser.store_id),
      dbService.getTransactions(currentUser.store_id),
    ]).catch(() => {});
  }, [currentUser.store_id]);

  const activeStoreId = currentUser.store_id;

  const tabContents = useMemo(() => ({
    dashboard: <Dashboard storeId={activeStoreId} refreshTrigger={refreshTrigger} />,
    pos: <POS storeId={activeStoreId} refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} currentUser={currentUser} />,
    invoices: <Invoices storeId={activeStoreId} refreshTrigger={refreshTrigger} setActiveTab={setActiveTab} />,
    catalog: <Catalog storeId={activeStoreId} refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />,
    sales: <Sales storeId={activeStoreId} refreshTrigger={refreshTrigger} />,
    staff: <Staff storeId={activeStoreId} refreshTrigger={refreshTrigger} />,
    profile: <Profile currentUser={currentUser} avatarUrl={avatarUrl} onAvatarChange={setAvatarUrl} />,
    help: <Help currentUser={currentUser} />,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [activeStoreId, refreshTrigger, currentUser, avatarUrl]);

  const tabKeys = Object.keys(tabContents) as (keyof typeof tabContents)[];

  return (
    <div className="min-h-screen bg-slate-50 flex">

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={onLogout}
        storeName={storeName}
        avatarUrl={avatarUrl}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={toggleSidebar}
      />

      <main className={`flex-1 ${sidebarCollapsed ? 'pl-[5.5rem]' : 'pl-64'} flex flex-col min-h-screen transition-[padding] duration-300 ease-out`}>

        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          avatarUrl={avatarUrl}
        />

        <div className={`${activeTab === 'pos' || activeTab === 'invoices' ? 'px-8' : 'p-8'} flex-1 overflow-x-hidden flex flex-col justify-between`}>

          <div className="flex-1">
            {tabKeys.map(tab => {
              if (!mountedTabs.has(tab)) return null;
              const isActive = activeTab === tab;
              return (
                <div key={tab} className={isActive ? '' : 'hidden'}>
                  {tabContents[tab]}
                </div>
              );
            })}
          </div>

          {activeTab !== 'pos' && activeTab !== 'invoices' && <Footer />}

        </div>
      </main>
    </div>
  );
}
