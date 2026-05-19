import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { authService, type UserProfile } from '../../lib/db';

// Import Page Modules (Symmetric with their respective sections folders)
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
  // Navigation State (Starts on business dashboard for admin, POS for cashier)
  const [activeTab, setActiveTab] = useState<string>(
    currentUser.role === 'admin' ? 'dashboard' : 'pos'
  );

  // State synchronization triggers
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

  const activeStoreId = currentUser.store_id;

  // Render the current active page/tab inside the layout frame
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            storeId={activeStoreId}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'pos':
        return (
          <POS
            storeId={activeStoreId}
            refreshTrigger={refreshTrigger}
            triggerRefresh={triggerRefresh}
            currentUser={currentUser}
          />
        );
      case 'invoices':
        return (
          <Invoices
            storeId={activeStoreId}
            refreshTrigger={refreshTrigger}
            setActiveTab={setActiveTab}
          />
        );
      case 'catalog':
        return (
          <Catalog
            storeId={activeStoreId}
            refreshTrigger={refreshTrigger}
            triggerRefresh={triggerRefresh}
          />
        );
      case 'sales':
        return (
          <Sales
            storeId={activeStoreId}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'staff':
        return (
          <Staff
            storeId={activeStoreId}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'profile':
        return (
          <Profile
            currentUser={currentUser}
            avatarUrl={avatarUrl}
            onAvatarChange={setAvatarUrl}
          />
        );
      case 'help':
        return <Help currentUser={currentUser} />;
      default:
        return (
          <Dashboard
            storeId={activeStoreId}
            refreshTrigger={refreshTrigger}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={onLogout}
        storeName={storeName}
        avatarUrl={avatarUrl}
      />

      {/* Main Body Container */}
      <main className="flex-1 pl-64 flex flex-col min-h-screen">

        {/* Header Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          avatarUrl={avatarUrl}
        />

        {/* Content Wrapper — POS & Invoices skip vertical padding so sidebars fill full height */}
        <div className={`${activeTab === 'pos' || activeTab === 'invoices' ? 'px-8' : 'p-8'} flex-1 overflow-x-hidden flex flex-col justify-between`}>

          {/* Active page views */}
          <div className="flex-1">
            {renderContent()}
          </div>

          {/* Standalone Footer */}
          {activeTab !== 'pos' && activeTab !== 'invoices' && <Footer />}

        </div>
      </main>
    </div>
  );
}
