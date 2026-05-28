import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Zap, Clock, Plus, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cn, timeAgo } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import api from '@/api/axios';
import useAuthStore from '@/store/authStore';

const containerVariants = {
  animate: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

function StatCard({ label, value, icon: Icon, trend, color, bg }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="bg-[#111827] border border-[#1E293B] rounded-xl p-5
                 hover:border-[#334155] transition-colors duration-200"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold text-[#F8FAFC] tracking-tight">{value}</p>
          <p className="text-sm text-[#475569] mt-1">{label}</p>
        </div>
        <div className={cn('p-2.5 rounded-lg', bg)}>
          <Icon size={18} className={color} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
        <span className="text-xs text-[#10B981] font-medium">{trend}</span>
      </div>
    </motion.div>
  );
}

function DocCard({ doc, index }) {
  const color = COLORS[index % COLORS.length];

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <Link
        to={`/documents/${doc._id}`}
        className="block bg-[#111827] border border-[#1E293B] rounded-xl p-4
                   hover:border-[#6366F1] transition-colors duration-200"
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 text-base"
          style={{ background: `${color}20` }}
        >
          {doc.icon || '📄'}
        </div>

        <h3 className="text-sm font-semibold text-[#F8FAFC] mb-1 truncate">
          {doc.title || 'Untitled Document'}
        </h3>
        <p className="text-xs text-[#475569]">
          {doc.collaborators?.length || 1} collaborator{(doc.collaborators?.length || 1) !== 1 ? 's' : ''}
        </p>

        <div className="mt-3 pt-3 border-t border-[#1E293B] flex items-center justify-between">
          <Badge variant="default">Saved</Badge>
          <span className="text-xs text-[#334155]">
            {timeAgo(doc.lastEditedAt || doc.updatedAt)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Dashboard() {
  const navigate          = useNavigate();
  const { user }          = useAuthStore();
  const [creating, setCreating] = useState(false);
  const [docs, setDocs]         = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real documents from API
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const { data } = await api.get('/documents');
        setDocs(data.documents || []);
      } catch {
        // silent — user might have no docs yet
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleNewDocument = async () => {
    setCreating(true);
    try {
      const { data } = await api.post('/documents');
      toast.success('Document created!');
      navigate(`/documents/${data.document._id}`);
    } catch {
      toast.error('Failed to create document');
    } finally {
      setCreating(false);
    }
  };

  // Real stats from actual documents
  const STATS = [
    {
      label: 'Documents',
      value: docs.length.toString(),
      icon: FileText,
      trend: docs.length > 0 ? `${docs.length} total` : 'No docs yet',
      color: 'text-[#6366F1]',
      bg: 'bg-[#6366F1]/10',
    },
    {
      label: 'Collaborators',
      value: '1',
      icon: Users,
      trend: 'Your workspace',
      color: 'text-[#10B981]',
      bg: 'bg-[#10B981]/10',
    },
    {
      label: 'Edits today',
      value: '0',
      icon: Zap,
      trend: 'Live syncing',
      color: 'text-[#8B5CF6]',
      bg: 'bg-[#8B5CF6]/10',
    },
    {
      label: 'Hours saved',
      value: '0',
      icon: Clock,
      trend: 'This month',
      color: 'text-[#F59E0B]',
      bg: 'bg-[#F59E0B]/10',
    },
  ];

  // Get user first name
  const firstName = user?.name?.split(' ')[0] || 'there';

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening';

  return (
    <div className="p-6 space-y-8">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
            {greeting}, {firstName} 👋
          </h2>
          <p className="text-[#475569] mt-1 text-sm">
            {docs.length > 0
              ? `You have ${docs.length} document${docs.length !== 1 ? 's' : ''} in your workspace.`
              : 'Create your first document to get started.'}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleNewDocument}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg
                     bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium
                     transition-colors shadow-lg shadow-indigo-500/25
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          {creating ? 'Creating…' : 'New Document'}
        </motion.button>
      </motion.div>

      {/* ── Stats Grid ── */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </motion.div>

      {/* ── Recent Documents ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#F8FAFC]">
            Recent Documents
          </h3>
          <Link
            to="/documents"
            className="flex items-center gap-1 text-xs text-[#6366F1]
                       hover:text-[#4F46E5] font-medium transition-colors"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : docs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center
                       bg-[#111827] border border-[#1E293B] rounded-xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#1E293B] flex items-center
                            justify-center mb-4">
              <FileText size={24} className="text-[#334155]" />
            </div>
            <h3 className="text-[#F8FAFC] font-semibold mb-2">No documents yet</h3>
            <p className="text-[#475569] text-sm mb-5">
              Create your first document to get started
            </p>
            <button
              onClick={handleNewDocument}
              className="flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[#6366F1] text-white text-sm font-medium"
            >
              <Plus size={14} /> Create Document
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {docs.slice(0, 4).map((doc, i) => (
              <DocCard key={doc._id} doc={doc} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}