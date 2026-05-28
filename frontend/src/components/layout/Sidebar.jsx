import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, Clock,
  Users, Settings, Plus, Zap, LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import api from '@/api/axios';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents', icon: FileText,        label: 'Documents' },
  { to: '/recent',    icon: Clock,           label: 'Recent' },
];

const TEAM_ITEMS = [
  { to: '/members',  icon: Users,    label: 'Members' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function NavItem({ to, icon: Icon, label, badge }) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <motion.div
          whileHover={{ x: 2 }}
          transition={{ duration: 0.1 }}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg mx-2 text-sm',
            'transition-colors duration-150 cursor-pointer select-none',
            isActive
              ? 'bg-[#6366F1]/10 text-[#6366F1]'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
          )}
        >
          <Icon size={16} className="flex-shrink-0" />
          <span className="font-medium flex-1">{label}</span>
          {badge && (
            <span className="bg-[#6366F1] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </motion.div>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const navigate         = useNavigate();
  const { user, logout } = useAuthStore();

  const handleNewDoc = async () => {
    try {
      const { data } = await api.post('/documents');
      toast.success('Document created!');
      navigate(`/documents/${data.document._id}`);
    } catch {
      toast.error('Failed to create document');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-56 flex-shrink-0 bg-[#111827] border-r border-[#1E293B] flex flex-col h-full"
    >
      {/* Logo */}
      <div className="p-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]
                          flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-semibold text-[#F8FAFC] text-base tracking-tight">
            SyncSpace
          </span>
        </div>
      </div>

      {/* New Document Button */}
      <div className="p-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNewDoc}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                     bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium
                     transition-colors duration-150"
        >
          <Plus size={16} />
          New Document
        </motion.button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        <p className="px-5 pb-1 text-[10px] font-semibold text-[#475569] uppercase tracking-widest">
          Workspace
        </p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>

        <p className="px-5 pt-5 pb-1 text-[10px] font-semibold text-[#475569] uppercase tracking-widest">
          Team
        </p>
        <div className="space-y-0.5">
          {TEAM_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
      </nav>

      {/* Copyright */}
      <div className="px-3 py-1">
        <p className="text-[9px] text-[#334155] text-center leading-relaxed">
          © 2024 Muhammad Immad Shahzad
        </p>
      </div>

      {/* User + Logout */}
      <div className="p-3 border-t border-[#1E293B]">
        <div className="flex items-center gap-2.5 p-2 rounded-lg">
          <Avatar
            name={user?.name || 'User'}
            size="sm"
            color={user?.cursorColor || '#6366F1'}
            online
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#F8FAFC] truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-[#475569] capitalize">
              {user?.role || 'member'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-[#475569] hover:text-[#EF4444]
                       hover:bg-[#EF4444]/10 transition-colors duration-150"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}