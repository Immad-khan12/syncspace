import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import {
  ArrowLeft, Save, Wifi, WifiOff,
  Bold, Italic, Underline as UnderlineIcon,
  Heading1, Heading2, List, ListOrdered,
  CheckSquare, Code, Quote, Undo, Redo,
  Strikethrough, Minus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { getSocket } from '@/sockets/socketClient';
import Avatar from '@/components/ui/Avatar';
import api from '@/api/axios';
import { cn } from '@/lib/utils';

function TB({ onClick, active, disabled, title, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded-md transition-colors text-sm',
        'disabled:opacity-30 disabled:cursor-not-allowed',
        active
          ? 'bg-[#6366F1]/20 text-[#6366F1]'
          : 'text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1E293B]'
      )}
    >
      {children}
    </button>
  );
}

export default function Editor() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuthStore();

  const [document, setDocument]     = useState(null);
  const [title, setTitle]           = useState('Untitled Document');
  const [isLoading, setIsLoading]   = useState(true);
  const [isSaving, setIsSaving]     = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const socketRef = useRef(null);

  // ── Build editor WITHOUT Yjs first — plain TipTap ──────────────────────────
  // This avoids the "Schema missing doc node" error from Yjs timing issues
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: "Start writing… ",
      }),
      CharacterCount,
    ],
    editorProps: {
      attributes: {
        class: [
          'prose prose-invert prose-lg max-w-none',
          'min-h-[60vh] py-6 px-1',
          'focus:outline-none',
          'text-[#CBD5E1] leading-relaxed',
        ].join(' '),
      },
    },
  });

  // ── Fetch document from API ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const { data } = await api.get(`/documents/${id}`);
        setDocument(data.document);
        setTitle(data.document.title || 'Untitled Document');

        // Set initial content if exists
        if (data.document.content && editor) {
          editor.commands.setContent(data.document.content);
        }
      } catch (err) {
        toast.error('Failed to load document');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchDocument();
  }, [id, editor]);

  // ── Socket connection ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !user) return;

    const socket = getSocket();
    socketRef.current = socket;

    socket.emit('document:join', { documentId: id });

    socket.on('connect',    () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('user:joined', ({ user: joinedUser }) => {
      setOnlineUsers((prev) => [...prev, joinedUser]);
      toast(`${joinedUser.name} joined`, { icon: '👋', duration: 2000 });
    });

    socket.on('user:left', ({ socketId }) => {
      setOnlineUsers((prev) => prev.filter((u) => u.socketId !== socketId));
    });

    socket.on('room:presence', ({ users }) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.emit('document:leave', { documentId: id });
      socket.off('connect');
      socket.off('disconnect');
      socket.off('user:joined');
      socket.off('user:left');
      socket.off('room:presence');
    };
  }, [id, user]);

  // ── Autosave ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!editor || !id) return;

    const saveContent = async () => {
      setIsSaving(true);
      try {
        const content = editor.getHTML();
        await api.patch(`/documents/${id}`, { title });
      } catch { /* silent fail */ }
      finally {
        setTimeout(() => setIsSaving(false), 1000);
      }
    };

    // Save on editor update — debounced
    const handler = setTimeout(saveContent, 2000);
    return () => clearTimeout(handler);
  }, [editor?.state, title, id]);

  // ── Title save ──────────────────────────────────────────────────────────────
  const handleTitleBlur = async () => {
    try {
      await api.patch(`/documents/${id}`, { title });
      socketRef.current?.emit('document:title', { documentId: id, title });
    } catch { /* silent */ }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      editor?.commands.focus();
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">

      {/* ── Topbar ── */}
      <div className="sticky top-0 z-20 bg-[#111827] border-b border-[#1E293B]">

        {/* Row 1 */}
        <div className="flex items-center gap-3 px-4 h-12">
          <motion.button
            whileHover={{ x: -2 }}
            onClick={() => navigate('/dashboard')}
            className="p-1.5 rounded-lg text-[#475569] hover:text-[#F8FAFC]
                       hover:bg-[#1E293B] transition-colors"
          >
            <ArrowLeft size={16} />
          </motion.button>

          <span className="text-lg">{document?.icon || '📄'}</span>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            placeholder="Untitled Document"
            className="flex-1 bg-transparent text-[#F8FAFC] text-sm font-semibold
                       placeholder:text-[#334155] focus:outline-none min-w-0"
          />

          {/* Online users */}
          <div className="flex items-center gap-2">
            {onlineUsers.slice(0, 4).map((u, i) => (
              <div key={u.socketId || i} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                <Avatar
                  name={u.name}
                  size="xs"
                  color={u.color || '#6366F1'}
                  className="border-2 border-[#111827]"
                />
              </div>
            ))}

            <AnimatePresence mode="wait">
              {isSaving ? (
                <motion.span
                  key="saving"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-xs text-[#6366F1] ml-2"
                >
                  <Save size={12} className="animate-pulse" /> Saving…
                </motion.span>
              ) : (
                <motion.span
                  key="saved"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-xs text-[#10B981] ml-2"
                >
                  {isConnected
                    ? <Wifi size={12} />
                    : <WifiOff size={12} className="text-[#EF4444]" />}
                  {isConnected ? 'Synced' : 'Reconnecting…'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Row 2 — Toolbar */}
        <div className="flex items-center flex-wrap gap-0.5 px-4 py-1.5 border-t border-[#1E293B]">
          <TB onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} title="Undo"><Undo size={14}/></TB>
          <TB onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} title="Redo"><Redo size={14}/></TB>
          <div className="w-px h-4 bg-[#1E293B] mx-1"/>
          <TB onClick={() => editor?.chain().focus().toggleBold().run()}      active={editor?.isActive('bold')}      title="Bold"><Bold size={14}/></TB>
          <TB onClick={() => editor?.chain().focus().toggleItalic().run()}    active={editor?.isActive('italic')}    title="Italic"><Italic size={14}/></TB>
          <TB onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Underline"><UnderlineIcon size={14}/></TB>
          <TB onClick={() => editor?.chain().focus().toggleStrike().run()}    active={editor?.isActive('strike')}    title="Strike"><Strikethrough size={14}/></TB>
          <div className="w-px h-4 bg-[#1E293B] mx-1"/>
          <TB onClick={() => editor?.chain().focus().toggleHeading({level:1}).run()} active={editor?.isActive('heading',{level:1})} title="H1"><Heading1 size={14}/></TB>
          <TB onClick={() => editor?.chain().focus().toggleHeading({level:2}).run()} active={editor?.isActive('heading',{level:2})} title="H2"><Heading2 size={14}/></TB>
          <div className="w-px h-4 bg-[#1E293B] mx-1"/>
          <TB onClick={() => editor?.chain().focus().toggleBulletList().run()}  active={editor?.isActive('bulletList')}  title="Bullet List"><List size={14}/></TB>
          <TB onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Numbered List"><ListOrdered size={14}/></TB>
          <TB onClick={() => editor?.chain().focus().toggleTaskList().run()}    active={editor?.isActive('taskList')}    title="Task List"><CheckSquare size={14}/></TB>
          <div className="w-px h-4 bg-[#1E293B] mx-1"/>
          <TB onClick={() => editor?.chain().focus().toggleCode().run()}       active={editor?.isActive('code')}       title="Code"><Code size={14}/></TB>
          <TB onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Quote"><Quote size={14}/></TB>
          <TB onClick={() => editor?.chain().focus().setHorizontalRule().run()}                                         title="Divider"><Minus size={14}/></TB>
        </div>
      </div>

      {/* ── Editor Body ── */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 pb-24">
        <EditorContent editor={editor} />
      </div>

      {/* ── Word count ── */}
      {editor && (
        <div className="fixed bottom-4 right-6 text-xs text-[#334155]
                        bg-[#111827] border border-[#1E293B] px-3 py-1.5 rounded-lg">
          {editor.storage.characterCount?.words() || 0} words
        </div>
      )}
    </div>
  );
}