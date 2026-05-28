import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import CommandPalette from '@/components/common/CommandPalette';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function AppLayout() {
  const location = useLocation();
  const [cmdOpen, setCmdOpen] = useState(false);

  // Global Ctrl+K listener
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-screen bg-[#0F172A] overflow-hidden">
      <Sidebar onNewDoc={() => setCmdOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onCmdOpen={() => setCmdOpen(true)} />

        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex-1 overflow-y-auto"
        >
          <Outlet />
        </motion.main>
      </div>

      {/* Command Palette — available on every page */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}