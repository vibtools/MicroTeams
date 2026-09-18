import React, { useState, useEffect } from 'react';
import { Navbar, NavViewMode } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ServicesPage } from './components/ServicesPage';
import { ApplyPage } from './components/ApplyPage';
import { ContactPage } from './components/ContactPage';
import { UserPanel } from './components/UserPanel';
import { AuthModal } from './components/AuthModal';
import { WorkerLoginForm } from './components/WorkerLoginForm';
import { PublicFooter } from './components/PublicFooter';
import { User } from './types';
import { updatePageSEO } from './utils/seo';
import { ToastSystem, ToastMessage } from './components/ToastSystem';

const resolveViewFromPath = (): NavViewMode => {
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path === '' || path === '/') return 'landing';
  if (path === '/services' || path === '/operations') return 'services';
  if (path === '/me') return 'user';
  if (path === '/apply' || path === '/join' || path === '/recruitment') return 'apply';
  if (path === '/contact' || path === '/contact-us') return 'contact';
  return 'not-found';
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dd_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Total Separation: Only field workers are permitted in the Worker client state
        if (parsed && parsed.role === 'worker') {
          return parsed;
        }
        localStorage.removeItem('dd_current_user');
        return null;
      } catch (e) {
        localStorage.removeItem('dd_current_user');
        return null;
      }
    }
    return null;
  });

  const [currentView, setCurrentView] = useState<NavViewMode>(() => resolveViewFromPath());

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [overviewStats, setOverviewStats] = useState<{
    totalDataUploaded: number;
    totalDataCollected: number;
    totalJobs: number;
    totalActiveWorkers: number;
    siteSettings: {
      siteName?: string;
      domain?: string;
      announcement?: string;
      logoUrl?: string;
      faviconUrl?: string;
    };
  }>({
    totalDataUploaded: 10000,
    totalDataCollected: 5500,
    totalJobs: 3,
    totalActiveWorkers: 2,
    siteSettings: {
      siteName: 'Team Dark Devil',
      domain: 'darkdevil.team',
      announcement: '🔥 Notice: US Email Q1 files updated. All approved submissions get 5% bonus today.',
      logoUrl: '',
      faviconUrl: '',
    },
  });

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/stats/overview');
      if (res.ok) {
        const data = await res.json();
        setOverviewStats(data);
        if (data.siteSettings?.faviconUrl) {
          let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.siteSettings.faviconUrl;
        }
        if (data.siteSettings?.siteName) {
          document.title = data.siteSettings.siteName;
        }
      }
    } catch (e) {
      console.warn('Overview stats fallback');
    }
  };

  const refreshCurrentUser = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/auth/user/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem('dd_current_user', JSON.stringify(data.user));
      }
    } catch (e) {
      console.warn('Refresh user fallback');
    }
  };

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    fetchOverview();

    const handlePopState = () => {
      setCurrentView(resolveViewFromPath());
    };

    const handleCustomToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: 'success' | 'error' | 'info' | 'warning' }>;
      if (customEvent.detail) {
        addToast(customEvent.detail.message, customEvent.detail.type);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('dd-toast', handleCustomToast as EventListener);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('dd-toast', handleCustomToast as EventListener);
    };
  }, []);

  const handleLoginSuccess = (user: User) => {
    // Total Separation: Only field workers can access the worker panel
    if (user.role !== 'worker') {
      localStorage.removeItem('dd_current_user');
      setCurrentUser(null);
      return;
    }

    setCurrentUser(user);
    localStorage.setItem('dd_current_user', JSON.stringify(user));
    handleNavigate('user');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dd_current_user');
    handleNavigate('landing');
  };

  const handleNavigate = (view: 'landing' | 'services' | 'apply' | 'contact' | 'user') => {
    setCurrentView(view);
    let targetPath = '/';
    let title = 'Team Dark Devil - Enterprise Microjob & Worker Management Platform';
    let desc = 'Microjob, email sending, and SMS sending worker team management platform with real-time operations, job orchestration, and disaster recovery.';

    if (view === 'services') {
      targetPath = '/services';
      title = 'Services & Operations | Team Dark Devil';
      desc = 'Explore active email sending, SMS dispatch, and microjob task queues.';
    } else if (view === 'user') {
      targetPath = '/me';
      title = 'Worker Dashboard | Team Dark Devil';
      desc = 'Manage your assigned microjobs, view earnings, and submit task proofs.';
    } else if (view === 'apply') {
      targetPath = '/apply';
      title = 'Join Team / Apply | Team Dark Devil';
      desc = 'Submit your worker application to join the Team Dark Devil network.';
    } else if (view === 'contact') {
      targetPath = '/contact';
      title = 'Contact Support | Team Dark Devil';
      desc = 'Get in touch with Team Dark Devil administrative support.';
    }

    updatePageSEO({
      title,
      description: desc,
      url: window.location.origin + targetPath,
    });

    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#C9D1D9] flex flex-col font-sans">
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        siteSettings={overviewStats.siteSettings}
      />

      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onOpenLogin={() => setIsAuthModalOpen(true)}
            onNavigateToServices={() => handleNavigate('services')}
            onNavigateToApply={() => handleNavigate('apply')}
            onNavigateToContact={() => handleNavigate('contact')}
            announcement={overviewStats.siteSettings?.announcement}
            siteSettings={overviewStats.siteSettings}
            stats={{
              totalDataUploaded: overviewStats.totalDataUploaded,
              totalDataCollected: overviewStats.totalDataCollected,
              totalJobs: overviewStats.totalJobs,
              totalActiveWorkers: overviewStats.totalActiveWorkers,
            }}
          />
        )}

        {currentView === 'services' && (
          <ServicesPage
            onNavigateHome={() => handleNavigate('landing')}
            onNavigateToServices={() => handleNavigate('services')}
            onNavigateToContact={() => handleNavigate('contact')}
            onNavigateToApply={() => handleNavigate('apply')}
            onOpenLogin={() => setIsAuthModalOpen(true)}
            siteSettings={overviewStats.siteSettings}
          />
        )}

        {currentView === 'apply' && (
          <ApplyPage
            onNavigateHome={() => handleNavigate('landing')}
            onNavigateToServices={() => handleNavigate('services')}
            onNavigateToContact={() => handleNavigate('contact')}
            onOpenLogin={() => setIsAuthModalOpen(true)}
            siteSettings={overviewStats.siteSettings}
          />
        )}

        {currentView === 'contact' && (
          <ContactPage
            onNavigateHome={() => handleNavigate('landing')}
            onNavigateToServices={() => handleNavigate('services')}
            onNavigateToApply={() => handleNavigate('apply')}
            onOpenLogin={() => setIsAuthModalOpen(true)}
            siteSettings={overviewStats.siteSettings}
          />
        )}

        {currentView === 'user' &&
          (currentUser ? (
            <UserPanel user={currentUser} onRefreshUser={refreshCurrentUser} />
          ) : (
            <div className="min-h-[calc(100vh-140px)] flex flex-col justify-between">
              <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <WorkerLoginForm
                  onLoginSuccess={handleLoginSuccess}
                  siteSettings={overviewStats.siteSettings}
                  isModal={false}
                />
              </div>
              <PublicFooter
                onNavigateHome={() => handleNavigate('landing')}
                onNavigateToServices={() => handleNavigate('services')}
                onNavigateToApply={() => handleNavigate('apply')}
                onNavigateToContact={() => handleNavigate('contact')}
                siteSettings={overviewStats.siteSettings}
              />
            </div>
          ))}

        {currentView === 'not-found' && (
          <LandingPage
            isNotFound={true}
            notFoundPath={typeof window !== 'undefined' ? window.location.pathname : '/unknown'}
            onNavigateHome={() => handleNavigate('landing')}
            announcement={overviewStats.siteSettings?.announcement}
            siteSettings={overviewStats.siteSettings}
            stats={{
              totalDataUploaded: overviewStats.totalDataUploaded,
              totalDataCollected: overviewStats.totalDataCollected,
              totalJobs: overviewStats.totalJobs,
              totalActiveWorkers: overviewStats.totalActiveWorkers,
            }}
          />
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen && currentView !== 'user'}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        siteSettings={overviewStats.siteSettings}
      />

      <ToastSystem toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
