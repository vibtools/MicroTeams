import React, { useState, useEffect } from 'react';
import { LeaderNavbar } from './LeaderNavbar';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminPanel } from './AdminPanel';
import { AdminUser, SiteSettings } from '../src/types';
import { TeamsChatBox } from '../src/components/TeamsChatBox';

export const LeaderApp: React.FC = () => {
  const [siteSettings, setSiteSettings] = useState<Partial<SiteSettings> | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        const settings = data?.settings || data;
        setSiteSettings(settings);
        if (settings?.faviconUrl) {
          let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = settings.faviconUrl;
        }
        if (settings?.siteName) {
          document.title = `${settings.siteName} | Leader Core Control`;
        }
      })
      .catch(() => {});
  }, []);

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    // Check dedicated leader storage
    const leaderSaved = localStorage.getItem('dd_leader_user');
    if (leaderSaved) {
      try {
        const parsed = JSON.parse(leaderSaved);
        if (['Administrator', 'Leader', 'Sub Leader', 'admin'].includes(parsed.role)) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }

    return null;
  });

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    localStorage.setItem('dd_leader_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dd_leader_user');
  };

  const isAuthorized =
    currentUser &&
    (currentUser.role === 'Administrator' ||
      currentUser.role === 'Leader' ||
      currentUser.role === 'Sub Leader' ||
      (currentUser.role as string) === 'admin');

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#C9D1D9] flex flex-col font-sans selection:bg-[#EF4444]/30">
      <LeaderNavbar currentUser={currentUser} onLogout={handleLogout} siteSettings={siteSettings || undefined} />

      <div className="flex-1">
        {isAuthorized ? (
          <>
            <AdminPanel currentUser={currentUser} />
            <TeamsChatBox
              currentUser={{
                id: currentUser.id,
                username: currentUser.username,
                role: currentUser.role,
              }}
            />
          </>
        ) : (
          <AdminLoginPage onLoginSuccess={handleLoginSuccess} siteSettings={siteSettings || undefined} />
        )}
      </div>
    </div>
  );
};
