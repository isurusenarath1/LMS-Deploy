import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserIcon, LockIcon, SaveIcon } from 'lucide-react';
import { toast } from 'sonner';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  // Profile state
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profile, setProfile] = useState<any>({
    name: '',
    email: '',
    phone: '',
    nic: '',
    badge: '',
    address: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { refreshUser } = useAuth();

  // Revoke object URL previews when file changes to avoid memory leaks
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Security state
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoadingProfile(true);
    try {
      const res = await userService.getProfile();
      if (res && res.success) {
        setProfile(res.user || {});
        if (res.user && res.user.profilePicture) {
          setAvatarPreview(res.user.profilePicture);
        }
      } else {
        toast.error(res.message || 'Failed to load profile');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error loading profile');
    } finally {
      setLoadingProfile(false);
    }
  }

  async function handleSaveProfile(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        name: profile.name,
        phone: profile.phone,
        nic: profile.nic,
        address: profile.address,
        badge: profile.badge
      };
      const res = await userService.updateProfile(payload);
      if (res && res.success) {
        toast.success('Profile updated');
        setProfile(res.user || profile);
        // if an avatar file is selected, upload it after profile update
        if (avatarFile) {
          try {
            const up = await userService.uploadProfilePicture(avatarFile);
            if (up && up.success) {
              const realUrl = up.url || up.data || up.profilePicture || up.path || up;
              setAvatarPreview(realUrl);
              // update local profile and global user
              setProfile({ ...profile, profilePicture: realUrl });
              // refresh global user so navbar updates
              try { await refreshUser(); } catch (e) {}
              toast.success('Profile picture uploaded');
            } else {
              toast.error(up.message || 'Failed to upload avatar');
            }
          } catch (err: any) {
            toast.error(err.message || 'Avatar upload failed');
          }
        }
      } else {
        toast.error(res.message || 'Failed to update profile');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await userService.changePassword(passwords);
      if (res && res.success) {
        toast.success('Password changed successfully');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(res.message || 'Failed to change password');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error changing password');
    } finally {
      setChangingPassword(false);
    }
  }

  return <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Account Settings
        </h1>
        <p className="text-gray-600">Manage your account preferences</p>
      </div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button onClick={() => setActiveTab('profile')} className={`flex items-center space-x-2 px-6 py-4 transition ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
            <UserIcon className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </button>
          <button onClick={() => setActiveTab('security')} className={`flex items-center space-x-2 px-6 py-4 transition ${activeTab === 'security' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
            <LockIcon className="w-5 h-5" />
            <span className="font-medium">Security</span>
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'profile' && <motion.form onSubmit={handleSaveProfile} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">{profile.name ? String(profile.name).charAt(0) : 'S'}</div>}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {profile.name}
                  </h2>
                  <p className="text-gray-600">Student ID: {profile.studentId || ''}</p>
                  <div className="mt-2">
                    <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                        const f = e.target.files && e.target.files[0];
                        if (f) {
                          setAvatarFile(f);
                          setAvatarPreview(URL.createObjectURL(f));
                        }
                      }} />
                      Change profile picture
                    </label>
                  </div>
                </div>
              </div>
              {loadingProfile && <div className="text-sm text-gray-600">Loading profile...</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input type="text" value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input type="email" value={profile.email || ''} disabled className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input type="tel" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIC
                  </label>
                  <input type="text" value={profile.nic || ''} onChange={e => setProfile({ ...profile, nic: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea rows={4} value={profile.address || ''} onChange={e => setProfile({ ...profile, address: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition" />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={savingProfile} className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-60">
                  <SaveIcon className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </motion.form>}
          {activeTab === 'security' && <motion.form onSubmit={handleChangePassword} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Change Password
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input type="password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition" />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" disabled={changingPassword} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-60">
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </motion.form>}
        </div>
      </div>
    </div>;
}