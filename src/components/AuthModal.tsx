import React from 'react';
import { User as UserType } from '../types';
import { WorkerLoginForm } from './WorkerLoginForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
  siteSettings?: {
    siteName?: string;
    logoUrl?: string;
    domain?: string;
  };
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  siteSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <WorkerLoginForm
        onLoginSuccess={onLoginSuccess}
        siteSettings={siteSettings}
        isModal={true}
        onClose={onClose}
      />
    </div>
  );
};
