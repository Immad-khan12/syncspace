import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Plus, Search, Trash2,
  Clock, Users, MoreHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/api/axios';
import { timeAgo } from '@/lib/utils';
import { CardSkeleton } from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';

const STATUS_MAP = {
  live:    { label: 'Live',    variant: 'success' },
  editing: { label: 'Editing', variant: 'primary' },
  saved:   { label: 'Saved',   variant: 'default' },
};

const COLORS = ['#6366F1','#8B5CF6','#10B981','#F59E0B','#EF4444','#3B82F6'];

function DocCard({ doc, onDelete, index }) {
  const color = COLORS[index % COLORS.length];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative bg-[#111827] border border-[#1E293B]
                 rounded-xl p-4 hover:border-[#6366F1] transition-colors duration-200"
    >
      <Link to={`/documents/${doc._id}`} className="block">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-lg"
          style={{ background: `${color}20` }}
        >
          {doc.icon || '📄'}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[#F8FAFC] mb-1 truncate pr-6">
          {doc.title || 'Untitled Document'}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-[#475569] mb-3">
          <span className="flex items-center gap-1">
            <Users size={11} />
            {doc.collaborators?.length || 1}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {timeAgo(doc.lastEditedAt || doc.updatedAt)}
          </span>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
          <Badge variant="default">
            {doc.owner?.name || 'You'}
          </Badge>
          <span className="text-[10px] text-[#334155]">
            {new Date(doc.createdAt).toLocaleDateString()}
          </span>
        </div>
      </Link>

      {/* Menu button */}
      <div className="absolute top-3 right-3">
        <button
          onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}
          className="p-1 rounded-md text-[#334155] hover:text-[#94A3B8]
                     hover:bg-[#1E293B] opacity-0 group-hover:opacity-100 transition-all"
        >
          <MoreHorizontal size={14} />
        </button>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-0 top-7 bg-[#1E293B] border border-[#334155]
                       rounded-lg py-1 w-36 z-10 shadow-xl"
          >
            <button
              onClick={(e) => { e.preventDefault(); onDelete(doc._id); setMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs
                         text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
            >
              <Trash2 size={12} /> Delete
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function Documents() {
  const navigate = useNavigate();
  const [docs, setDocs]         = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creating, setCreating]   = useState(false);
  const [search, setSearch]       = useState('');

  // Fetch all documents
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const { data } = await api.get('/documents');
        setDocs(data.documents);
      } catch {
        toast.error('Failed to load documents');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleCreate = async () => {
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

  const handleDelete = async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      setDocs((prev) => prev.filter((d) => d._id !== id));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  // Filter by search
  const filtered = docs.filter((d) =>
    (d.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
            Documents
          </h2>
          <p className="text-[#475569] text-sm mt-1">
            {docs.length} document{docs.length !== 1 ? 's' : ''} in your workspace
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg
                     bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium
                     transition-colors shadow-lg shadow-indigo-500/25
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          {creating ? 'Creating…' : 'New Document'}
        </motion.button>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents…"
          className="w-full h-10 pl-9 pr-4 rounded-lg bg-[#111827] border border-[#1E293B]
                     text-[#F8FAFC] text-sm placeholder:text-[#475569]
                     focus:outline-none focus:ring-2 focus:ring-[#6366F1]
                     focus:border-transparent transition-all"
        />
      </div>

      {/* ── Documents Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#1E293B] flex items-center
                          justify-center mb-4">
            <FileText size={28} className="text-[#334155]" />
          </div>
          <h3 className="text-[#F8FAFC] font-semibold mb-2">
            {search ? 'No documents found' : 'No documents yet'}
          </h3>
          <p className="text-[#475569] text-sm mb-6">
            {search ? 'Try a different search term' : 'Create your first document to get started'}
          </p>
          {!search && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[#6366F1] text-white text-sm font-medium"
            >
              <Plus size={14} /> Create Document
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((doc, i) => (
            <DocCard
              key={doc._id}
              doc={doc}
              index={i}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}