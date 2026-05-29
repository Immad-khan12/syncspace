import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield, Crown, Eye, UserPlus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import api from '@/api/axios';

const ROLE_MAP = {
  admin:  { label: 'Admin',  variant: 'primary', icon: Crown  },
  editor: { label: 'Editor', variant: 'success', icon: Shield },
  viewer: { label: 'Viewer', variant: 'default', icon: Eye    },
  user:   { label: 'Member', variant: 'default', icon: Shield },
};

function MemberRow({ member, index, isCurrentUser }) {
  const role = member.role || 'user';
  const { label, variant, icon: RoleIcon } = ROLE_MAP[role] || ROLE_MAP.user;

  const isOnline =
    member.lastSeen &&
    new Date() - new Date(member.lastSeen) < 5 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-[#111827]
                 border border-[#1E293B] hover:border-[#334155] transition-colors"
    >
      <Avatar
        name={member.name}
        size="md"
        color={member.cursorColor || '#6366F1'}
        online={isOnline}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#F8FAFC] truncate">
            {member.name}
          </p>
          {isCurrentUser && <Badge variant="primary">You</Badge>}
        </div>
        <p className="text-xs text-[#475569] truncate">{member.email}</p>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isOnline ? 'bg-[#10B981]' : 'bg-[#334155]'
          }`}
        />
        <span className="text-xs text-[#475569]">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      <Badge variant={variant}>
        <RoleIcon size={10} />
        {label}
      </Badge>
    </motion.div>
  );
}

export default function Members() {
  const { user }                      = useAuthStore();
  const [members, setMembers]         = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting]       = useState(false);

  // ✅ Real API se users fetch
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data } = await api.get('/auth/users');
        setMembers(data.users);
      } catch {
        toast.error('Failed to load members');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail || !/\S+@\S+\.\S+/.test(inviteEmail)) {
      toast.error('Enter a valid email address');
      return;
    }
    setInviting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success(`Invite sent to ${inviteEmail}!`);
      setInviteEmail('');
    } catch {
      toast.error('Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const onlineCount = members.filter(
    (m) =>
      m.lastSeen &&
      new Date() - new Date(m.lastSeen) < 5 * 60 * 1000
  ).length;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
            Members
          </h2>
          <p className="text-[#475569] text-sm mt-1">
            {isLoading
              ? 'Loading…'
              : `${members.length} members · ${onlineCount} online now`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {members
            .filter(
              (m) =>
                m.lastSeen &&
                new Date() - new Date(m.lastSeen) < 5 * 60 * 1000
            )
            .slice(0, 5)
            .map((m) => (
              <Avatar
                key={m._id}
                name={m.name}
                size="sm"
                color={m.cursorColor || '#6366F1'}
                online
              />
            ))}
        </div>
      </motion.div>

      {/* Invite Box */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-[#111827] border border-[#1E293B] rounded-xl p-5"
      >
        <h3 className="text-sm font-semibold text-[#F8FAFC] mb-1 flex items-center gap-2">
          <UserPlus size={15} className="text-[#6366F1]" />
          Invite Team Member
        </h3>
        <p className="text-xs text-[#475569] mb-4">
          Send an invitation link to collaborate
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]"
            />
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              placeholder="colleague@company.com"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#0F172A]
                         border border-[#1E293B] text-[#F8FAFC] text-sm
                         placeholder:text-[#475569] focus:outline-none
                         focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={handleInvite}
            disabled={inviting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm
                       font-medium transition-colors
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <UserPlus size={14} />
            {inviting ? 'Sending…' : 'Invite'}
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members…"
          className="w-full h-10 pl-9 pr-4 rounded-lg bg-[#111827]
                     border border-[#1E293B] text-[#F8FAFC] text-sm
                     placeholder:text-[#475569] focus:outline-none
                     focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all"
        />
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-[#111827] border border-[#1E293B] animate-pulse"
            />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[#475569] text-sm">
            {search ? `No members found for "${search}"` : 'No members yet'}
          </div>
        ) : (
          filtered.map((member, i) => (
            <MemberRow
              key={member._id}
              member={member}
              index={i}
              isCurrentUser={member.email === user?.email}
            />
          ))
        )}
      </div>

      {/* Role Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-[#111827] border border-[#1E293B] rounded-xl p-4"
      >
        <p className="text-xs font-semibold text-[#475569] mb-3 uppercase tracking-widest">
          Role Permissions
        </p>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(ROLE_MAP)
            .slice(0, 3)
            .map(([role, { label, variant, icon: Icon }]) => (
              <div key={role} className="flex items-center gap-2">
                <Badge variant={variant}>
                  <Icon size={10} /> {label}
                </Badge>
                <span className="text-xs text-[#334155]">
                  {role === 'admin'
                    ? 'Full access'
                    : role === 'editor'
                    ? 'Can edit'
                    : 'Read only'}
                </span>
              </div>
            ))}
        </div>
      </motion.div>

      <p className="text-center text-[10px] text-[#334155]">
        © 2024 Muhammad Immad Shahzad. All rights reserved.
      </p>
    </div>
  );
}