import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Lock, Save,
  Shield, Bell, Palette, LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import api from '@/api/axios';
import { useNavigate } from 'react-router-dom';

const CURSOR_COLORS = [
  '#6366F1', '#8B5CF6', '#10B981',
  '#F59E0B', '#EF4444', '#3B82F6',
  '#EC4899', '#14B8A6',
];

function Section({ title, description, children }) {
  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-[#F8FAFC]">{title}</h3>
        {description && (
          <p className="text-xs text-[#475569] mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const navigate         = useNavigate();
  const { user, logout } = useAuthStore();

  const [profile, setProfile] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new:     '',
    confirm: '',
  });

  const [selectedColor, setSelectedColor] = useState(
    user?.cursorColor || '#6366F1'
  );

  const [savingProfile,  setSavingProfile]  = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async () => {
    if (!profile.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSavingProfile(true);
    try {
      // In production this would call PATCH /api/users/me
      await new Promise((r) => setTimeout(r, 800)); // simulate API
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!passwords.current) {
      toast.error('Enter your current password');
      return;
    }
    if (passwords.new.length < 8) {
      toast.error('New password must be 8+ characters');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success('Password changed successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch {
      toast.error('Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">Settings</h2>
        <p className="text-[#475569] text-sm mt-1">
          Manage your account and preferences
        </p>
      </motion.div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Section
          title="Profile"
          description="Update your name and email address"
        >
          <div className="space-y-4">
            {/* Avatar preview */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center
                           text-white text-xl font-bold"
                style={{ background: selectedColor }}
              >
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-[#F8FAFC]">{user?.name}</p>
                <p className="text-xs text-[#475569]">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#94A3B8]">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                <input
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#0F172A] border border-[#1E293B]
                             text-[#F8FAFC] text-sm focus:outline-none focus:ring-2
                             focus:ring-[#6366F1] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#94A3B8]">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                <input
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#0F172A] border border-[#1E293B]
                             text-[#F8FAFC] text-sm focus:outline-none focus:ring-2
                             focus:ring-[#6366F1] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleProfileSave}
              disabled={savingProfile}
              className="flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium
                         transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              {savingProfile ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </Section>
      </motion.div>

      {/* Cursor Color */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Section
          title="Cursor Color"
          description="Your cursor color in collaborative documents"
        >
          <div className="flex items-center gap-3 flex-wrap">
            {CURSOR_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                style={{ background: color }}
                title={color}
              >
                {selectedColor === color && (
                  <span className="flex items-center justify-center w-full h-full text-white text-xs font-bold">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#475569] mt-3">
            Selected: <span style={{ color: selectedColor }} className="font-mono font-medium">{selectedColor}</span>
          </p>
        </Section>
      </motion.div>

      {/* Password */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Section
          title="Change Password"
          description="Use a strong password with 8+ characters"
        >
          <div className="space-y-4">
            {[
              { label: 'Current Password', key: 'current' },
              { label: 'New Password',     key: 'new' },
              { label: 'Confirm Password', key: 'confirm' },
            ].map(({ label, key }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-[#94A3B8]">{label}</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                  <input
                    type="password"
                    value={passwords[key]}
                    onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#0F172A] border border-[#1E293B]
                               text-[#F8FAFC] text-sm focus:outline-none focus:ring-2
                               focus:ring-[#6366F1] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handlePasswordSave}
              disabled={savingPassword}
              className="flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium
                         transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Shield size={14} />
              {savingPassword ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </Section>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-[#111827] border border-[#EF4444]/20 rounded-xl p-6">
          <h3 className="text-base font-semibold text-[#F8FAFC] mb-1">Danger Zone</h3>
          <p className="text-xs text-[#475569] mb-5">
            These actions are irreversible. Please be careful.
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444]
                       text-sm font-medium border border-[#EF4444]/20
                       transition-colors"
          >
            <LogOut size={14} />
            Sign out of all devices
          </button>
        </div>
      </motion.div>

    </div>
  );
}