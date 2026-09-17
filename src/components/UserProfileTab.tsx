import React, { useState, useRef, useEffect } from 'react';
import {
  User as UserIcon,
  Camera,
  Save,
  Key,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Phone,
  MapPin,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  Calendar,
  Zap,
  Briefcase,
  Database,
  Lock,
} from 'lucide-react';
import { User } from '../types';

interface UserProfileTabProps {
  user: User;
  onRefreshUser: () => void;
}

export const UserProfileTab: React.FC<UserProfileTabProps> = ({ user, onRefreshUser }) => {
  // Profile Information Form State
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [email, setEmail] = useState(user.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Status & Feedback States
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrlInput, setTempUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when user prop updates
  useEffect(() => {
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setPhone(user.phone || '');
    setAddress(user.address || '');
    setEmail(user.email || '');
    setAvatarUrl(user.avatarUrl || '');
  }, [user]);

  // Handle Photo File Upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setProfileMsg({ type: 'error', text: 'Please select a valid image file (PNG, JPG, WEBP, GIF).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ type: 'error', text: 'Image size should be under 5MB.' });
      return;
    }

    setIsUploadingAvatar(true);
    setProfileMsg(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        setAvatarUrl(base64Data);

        // Auto-save avatar to server
        const res = await fetch(`/api/users/${user.id}/avatar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: base64Data }),
        });

        const data = await res.json();
        setIsUploadingAvatar(false);

        if (res.ok && data.success) {
          setProfileMsg({ type: 'success', text: 'Profile photo updated successfully.' });
          onRefreshUser();
        } else {
          setProfileMsg({ type: 'error', text: data.error || 'Failed to update profile photo.' });
        }
      };

      reader.onerror = () => {
        setIsUploadingAvatar(false);
        setProfileMsg({ type: 'error', text: 'Failed to read image file.' });
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploadingAvatar(false);
      setProfileMsg({ type: 'error', text: err.message || 'Error processing image.' });
    }
  };

  // Handle Drag and Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle Remove Photo
  const handleRemovePhoto = async () => {
    setIsUploadingAvatar(true);
    setProfileMsg(null);
    try {
      const res = await fetch(`/api/users/${user.id}/avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: '' }),
      });
      const data = await res.json();
      setIsUploadingAvatar(false);
      if (res.ok && data.success) {
        setAvatarUrl('');
        setProfileMsg({ type: 'success', text: 'Profile photo removed.' });
        onRefreshUser();
      } else {
        setProfileMsg({ type: 'error', text: data.error || 'Failed to remove photo.' });
      }
    } catch (err: any) {
      setIsUploadingAvatar(false);
      setProfileMsg({ type: 'error', text: err.message || 'Failed to remove photo.' });
    }
  };

  // Handle Apply Image URL
  const handleApplyUrl = async () => {
    if (!tempUrlInput.trim()) return;
    setIsUploadingAvatar(true);
    setProfileMsg(null);
    try {
      const res = await fetch(`/api/users/${user.id}/avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: tempUrlInput.trim() }),
      });
      const data = await res.json();
      setIsUploadingAvatar(false);
      if (res.ok && data.success) {
        setAvatarUrl(tempUrlInput.trim());
        setShowUrlInput(false);
        setTempUrlInput('');
        setProfileMsg({ type: 'success', text: 'Profile photo URL saved.' });
        onRefreshUser();
      } else {
        setProfileMsg({ type: 'error', text: data.error || 'Failed to save photo URL.' });
      }
    } catch (err: any) {
      setIsUploadingAvatar(false);
      setProfileMsg({ type: 'error', text: err.message || 'Failed to save photo URL.' });
    }
  };

  // Handle Save Profile Info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          email: email.trim(),
          avatarUrl: avatarUrl,
        }),
      });

      const data = await res.json();
      setIsSavingProfile(false);

      if (res.ok && data.success) {
        setProfileMsg({ type: 'success', text: 'Profile details saved successfully.' });
        onRefreshUser();
      } else {
        setProfileMsg({ type: 'error', text: data.error || 'Failed to save profile details.' });
      }
    } catch (err: any) {
      setIsSavingProfile(false);
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!newPassword || newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 4 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch(`/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      setIsChangingPassword(false);

      if (res.ok && data.success) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: data.error || 'Failed to change password.' });
      }
    } catch (err: any) {
      setIsChangingPassword(false);
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    }
  };

  const displayName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : user.username;

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Top Header Card: Profile Identity & Quick Stats */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 text-[#C9D1D9]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Avatar Section with Upload Overlay */}
            <div
              className={`relative w-14 h-14 rounded-full bg-[#12171F] border-2 ${
                isDragOver ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/40' : 'border-[#30363D]'
              } flex items-center justify-center overflow-hidden shrink-0 group transition-all`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarUrl('')}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[16px] font-mono text-[#38BDF8] bg-[#0E1E2E]">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
              )}

              {/* Hover upload button overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                title="Change profile photo"
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
                ) : (
                  <Camera className="w-4 h-4 text-[#38BDF8]" />
                )}
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] text-[#E6EDF3] font-light">{displayName}</h2>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase bg-[#0C2117] text-[#22C55E] border border-[#124D31]">
                  Worker
                </span>
              </div>
              <div className="text-[11px] text-[#8B949E] font-mono mt-0.5 flex flex-wrap items-center gap-2">
                <span>@{user.username}</span>
                <span>•</span>
                <span>ID: {user.id}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Joined: {user.joiningDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Avatar Action Buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#38BDF8] border border-[#30363D] flex items-center gap-1"
            >
              <Camera className="w-3 h-3" />
              <span>Change Photo</span>
            </button>

            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isUploadingAvatar}
                title="Remove photo"
                className="vib-btn-sm bg-[#12171F] hover:bg-[#280D12] text-[#8B949E] hover:text-[#F87171] border border-[#30363D] hover:border-[#5C1D24] p-1.5"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="vib-btn-sm bg-[#12171F] hover:bg-[#181F2B] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] text-[10.5px]"
            >
              {showUrlInput ? 'Hide URL' : 'Paste URL'}
            </button>
          </div>
        </div>

        {/* Optional Avatar URL Input Expand */}
        {showUrlInput && (
          <div className="mt-3 pt-3 border-t border-[#21262D] flex items-center gap-2">
            <input
              type="url"
              value={tempUrlInput}
              onChange={(e) => setTempUrlInput(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="vib-input text-[11px] font-mono flex-1"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              disabled={!tempUrlInput.trim() || isUploadingAvatar}
              className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] shrink-0"
            >
              Apply URL
            </button>
          </div>
        )}

        {/* Quick Performance Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-[#21262D]">
          <div className="bg-[#12171F] border border-[#21262D] rounded-[6px] p-2">
            <div className="text-[10px] text-[#8B949E] flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#22C55E]" />
              <span>Daily Capacity</span>
            </div>
            <div className="text-[13px] font-mono text-[#22C55E] mt-0.5">Unlimited</div>
          </div>

          <div className="bg-[#12171F] border border-[#21262D] rounded-[6px] p-2">
            <div className="text-[10px] text-[#8B949E] flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-[#38BDF8]" />
              <span>Jobs Completed</span>
            </div>
            <div className="text-[13px] font-mono text-[#E6EDF3] mt-0.5">
              {user.totalJobsCount || 0}
            </div>
          </div>

          <div className="bg-[#12171F] border border-[#21262D] rounded-[6px] p-2">
            <div className="text-[10px] text-[#8B949E] flex items-center gap-1">
              <Database className="w-3 h-3 text-[#38BDF8]" />
              <span>Total Collected</span>
            </div>
            <div className="text-[13px] font-mono text-[#38BDF8] mt-0.5">
              {user.totalCollectedData || 0}
            </div>
          </div>

          <div className="bg-[#12171F] border border-[#21262D] rounded-[6px] p-2">
            <div className="text-[10px] text-[#8B949E] flex items-center gap-1">
              <Database className="w-3 h-3 text-[#8B949E]" />
              <span>Total Used Data</span>
            </div>
            <div className="text-[13px] font-mono text-[#E6EDF3] mt-0.5">
              {user.totalUsedData || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Personal Info Form (Left) & Security/Password (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Section 1: Personal Information */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 text-[#C9D1D9] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#21262D] mb-3.5">
              <UserCheck className="w-4 h-4 text-[#38BDF8]" />
              <h3 className="text-[13px] text-[#E6EDF3] font-light">Personal Information</h3>
            </div>

            {profileMsg && (
              <div
                className={`mb-3 p-2 rounded-[6px] text-[11.5px] border flex items-center gap-2 ${
                  profileMsg.type === 'success'
                    ? 'bg-[#0C2117] border-[#124D31] text-[#4ADE80]'
                    : 'bg-[#280D12] border-[#5C1D24] text-[#F87171]'
                }`}
              >
                {profileMsg.type === 'success' ? (
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form id="profileForm" onSubmit={handleSaveProfile} className="space-y-3">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="vib-input"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8B949E] mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Mercer"
                    className="vib-input"
                  />
                </div>
              </div>

              {/* Username (Readonly) */}
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">Username</label>
                <input
                  type="text"
                  disabled
                  value={user.username}
                  className="vib-input font-mono bg-[#0D1117] opacity-75 cursor-not-allowed text-[#8B949E]"
                />
              </div>

              {/* Contact Phone Number */}
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#8B949E]" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 234-5678"
                  className="vib-input font-mono"
                />
              </div>

              {/* Residential / Work Address */}
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#8B949E]" />
                  <span>Address / Location</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Austin, Texas, USA"
                  className="vib-input"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#8B949E]" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="worker@darkdevil.team"
                  className="vib-input font-mono"
                />
              </div>
            </form>
          </div>

          <div className="pt-4 mt-2 border-t border-[#21262D]">
            <button
              type="submit"
              form="profileForm"
              disabled={isSavingProfile}
              className="vib-btn-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#2563EB] flex items-center justify-center gap-1.5 w-full"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 2: Security & Password Management */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-4 text-[#C9D1D9] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#21262D] mb-3.5">
              <Lock className="w-4 h-4 text-[#38BDF8]" />
              <h3 className="text-[13px] text-[#E6EDF3] font-light">Security &amp; Password</h3>
            </div>

            {passwordMsg && (
              <div
                className={`mb-3 p-2 rounded-[6px] text-[11.5px] border flex items-center gap-2 ${
                  passwordMsg.type === 'success'
                    ? 'bg-[#0C2117] border-[#124D31] text-[#4ADE80]'
                    : 'bg-[#280D12] border-[#5C1D24] text-[#F87171]'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form id="passwordForm" onSubmit={handleChangePassword} className="space-y-3">
              {/* Current Password */}
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">Current Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="vib-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#E6EDF3] p-1"
                  >
                    {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">New Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 4 characters"
                    className="vib-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#E6EDF3] p-1"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">Confirm New Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="vib-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#E6EDF3] p-1"
                  >
                    {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {newPassword && confirmPassword && (
                  <div className="mt-1 text-[10px]">
                    {newPassword === confirmPassword ? (
                      <span className="text-[#22C55E] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-[#F87171] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>

            </form>
          </div>

          <div className="pt-3 mt-2 border-t border-[#21262D]">
            <button
              type="submit"
              form="passwordForm"
              disabled={isChangingPassword || !newPassword || newPassword !== confirmPassword}
              className="vib-btn-sm bg-[#1C2128] hover:bg-[#282E37] text-[#38BDF8] border border-[#30363D] flex items-center justify-center gap-1.5 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
