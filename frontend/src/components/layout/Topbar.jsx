import { motion } from 'framer-motion';
import { Bell, Command } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import useAuthStore from '@/store/authStore';

const ONLINE_USERS = [
  { name: 'Alex Kim',   color: '#6366F1' },
  { name: 'Jordan Lee', color: '#10B981' },
  { name: 'Riley M.',   color: '#8B5CF6' },
];

export default function Topbar({ title = 'Dashboard', onCmdOpen }) {
  const { user } = useAuthStore();

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="h-12 flex-shrink-0 bg-[#111827] border-b border-[#1E293B]
                 flex items-center gap-3 px-4"
    >
      <h1 className="text-sm font-semibold text-[#F8FAFC] flex-1">{title}</h1>

      {/* Online users */}
      <div className="flex items-center">
        {ONLINE_USERS.map((u, i) => (
          <motion.div
            key={u.name}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            style={{ marginLeft: i === 0 ? 0 : -8 }}
            title={u.name}
          >
            <Avatar
              name={u.name}
              size="xs"
              color={u.color}
              className="border-2 border-[#111827]"
            />
          </motion.div>
        ))}
        <span className="ml-2 text-xs text-[#10B981] font-medium">
          ● {ONLINE_USERS.length} online
        </span>
      </div>

      <div className="w-px h-5 bg-[#1E293B]" />

      {/* ⌘K button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCmdOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
                   bg-[#1E293B] border border-[#334155] text-[#475569]
                   text-xs font-medium hover:border-[#6366F1] hover:text-[#6366F1]
                   transition-colors duration-150"
      >
        <Command size={12} />
        <span>K</span>
      </motion.button>

      {/* Notifications */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative p-1.5 rounded-lg text-[#475569] hover:text-[#F8FAFC]
                   hover:bg-[#1E293B] transition-colors duration-150"
      >
        <Bell size={16} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#6366F1] rounded-full" />
      </motion.button>
    </motion.header>
  );
}