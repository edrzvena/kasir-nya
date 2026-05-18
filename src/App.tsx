import { useState, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import ResetPassword from './pages/auth/ResetPassword';
import { authService, type UserProfile, supabase } from './lib/db';
import KasirIcon from './components/ui/KasirIcon';

function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Load active user session on app start
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionUser = await authService.getCurrentSession();
        setCurrentUser(sessionUser);
      } catch (err) {
        console.error('Failed to restore active session:', err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    // Check for password recovery hash parameters in URL
    if (window.location.hash.includes('type=recovery')) {
      setIsResettingPassword(true);
    }

    // Connect Supabase session listener for interactive PASSWORD_RECOVERY triggers
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsResettingPassword(true);
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-indigo-650 rounded-3xl flex items-center justify-center text-white mx-auto animate-bounce shadow-xl shadow-indigo-155/20">
            <KasirIcon className="h-8 w-8" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block animate-pulse">
            Loading POS Session...
          </span>
        </div>
      </div>
    );
  }

  // Intercept and present Reset Password recovery page if active
  if (isResettingPassword) {
    return <ResetPassword onSuccess={() => setIsResettingPassword(false)} />;
  }

  if (!currentUser) {
    return <Login onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <MainLayout 
      currentUser={currentUser} 
      onLogout={() => setCurrentUser(null)} 
    />
  );
}

export default App;
