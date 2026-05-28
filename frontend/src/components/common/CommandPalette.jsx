import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, FileText, LayoutDashboard,
  Users, Settings, Plus, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/api/axios';

const STATIC_COMMANDS = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, path: '/dashboard', group: 'Navigation' },
  { id: 'documents', label: 'Go to Documents', icon: FileText,         path: '/documents',  group: 'Navigation' },
  { id: 'members',   label: 'Go to Members',   icon: Users,            path: '/members',    group: 'Navigation' },
  { id: 'settings',  label: 'Go to Settings',  icon: Settings,         path: '/settings',   group: 'Navigation' },
  { id: 'new',       label: 'New Document',     icon: Plus,             path: null,          group: 'Actions'    },
];

export default function CommandPalette({ open, onClose }) {
  const navigate     = useNavigate();
  const [query, setQuery]     = useState('');
  const [docs, setDocs]       = useState([]);
  const [active, setActive]   = useState(0);

  // Fetch documents for quick navigation
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    api.get('/documents')
      .then(({ data }) => setDocs(data.documents || []))
      .catch(() => {});
  }, [open]);

  // Build command list
  const docCommands = docs.map((d) => ({
    id: d._id,
    label: d.title || 'Untitled Document',
    icon: FileText,
    path: `/documents/${d._id}`,
    group: 'Documents',
  }));

  const allCommands = [...STATIC_COMMANDS, ...docCommands];

  const filtered = query
    ? allCommands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands;

  // Group commands
  const groups = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  const flatFiltered = Object.values(groups).flat();

  const handleSelect = useCallback(async (cmd) => {
    onClose();
    if (cmd.id === 'new') {
      try {
        const { data } = await api.post('/documents');
        navigate(`/documents/${data.document._id}`);
      } catch { /* silent */ }
    } else if (cmd.path) {
      navigate(cmd.path);
    }
  }, [navigate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((p) => Math.min(p + 1, flatFiltered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((p) => Math.max(p - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatFiltered[active]) handleSelect(flatFiltered[active]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, active, flatFiltered, handleSelect, onClose]);

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open ? onClose() : null;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  let itemIndex = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Palette */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-full max-w-lg bg-[#111827] border border-[#1E293B]
                         rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E293B]">
                <Search size={16} className="text-[#475569] flex-shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                  placeholder="Search commands, documents…"
                  className="flex-1 bg-transparent text-[#F8FAFC] text-sm
                             placeholder:text-[#475569] focus:outline-none"
                />
                <kbd className="text-[10px] text-[#334155] bg-[#1E293B] px-1.5 py-0.5 rounded">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {Object.entries(groups).map(([group, commands]) => (
                  <div key={group}>
                    <p className="px-4 py-1.5 text-[10px] font-semibold text-[#334155] uppercase tracking-widest">
                      {group}
                    </p>
                    {commands.map((cmd) => {
                      const currentIndex = itemIndex++;
                      const isActive = currentIndex === active;
                      return (
                        <motion.button
                          key={cmd.id}
                          onClick={() => handleSelect(cmd)}
                          onMouseEnter={() => setActive(currentIndex)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                            isActive
                              ? 'bg-[#6366F1]/10 text-[#6366F1]'
                              : 'text-[#94A3B8] hover:bg-[#1E293B]'
                          )}
                        >
                          <cmd.icon size={15} className="flex-shrink-0" />
                          <span className="flex-1 text-left truncate">{cmd.label}</span>
                          {isActive && <ArrowRight size={13} />}
                        </motion.button>
                      );
                    })}
                  </div>
                ))}

                {filtered.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-[#334155]">
                    No results for "{query}"
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-[#1E293B] flex items-center gap-4">
                <span className="text-[10px] text-[#334155] flex items-center gap-1">
                  <kbd className="bg-[#1E293B] px-1 rounded">↑↓</kbd> navigate
                </span>
                <span className="text-[10px] text-[#334155] flex items-center gap-1">
                  <kbd className="bg-[#1E293B] px-1 rounded">↵</kbd> select
                </span>
                <span className="text-[10px] text-[#334155] flex items-center gap-1">
                  <kbd className="bg-[#1E293B] px-1 rounded">esc</kbd> close
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}