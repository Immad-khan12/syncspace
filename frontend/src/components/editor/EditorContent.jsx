// EditorContent.jsx — The collaborative TipTap rich text editor
// Powered by Yjs for real-time sync and Collaboration extension for cursors

import { useEffect } from 'react';
import { useEditor, EditorContent as TipTapContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import * as Y from 'yjs';
import useAuthStore from '@/store/authStore';
import { getSocket } from '@/sockets/socketClient';

export default function EditorContent({ yjsDoc, documentId }) {
  const { user } = useAuthStore();
  const socket   = getSocket();

  const editor = useEditor({
    extensions: [
      // StarterKit includes: Bold, Italic, Headings, Lists, Code, Blockquote, etc.
      // We disable its history because Yjs handles undo/redo instead
      StarterKit.configure({
        history: false, // IMPORTANT: must disable — Yjs has its own undo manager
      }),

      Underline,

      TaskList,
      TaskItem.configure({ nested: true }),

      // Collaboration binds TipTap to the Yjs document
      // 'content' is the name of the shared text type in the Yjs doc
      Collaboration.configure({
        document: yjsDoc,
        field: 'content',
      }),

      // CollaborationCursor shows other users' cursors with their name and color
      CollaborationCursor.configure({
        provider: {
          // We implement a minimal provider interface for socket-based cursor sharing
          awareness: {
            getLocalState: () => ({
              user: {
                name:  user?.name  || 'Anonymous',
                color: user?.cursorColor || '#6366F1',
              },
            }),
            setLocalState: () => {},
            on:  () => {},
            off: () => {},
          },
        },
        user: {
          name:  user?.name  || 'Anonymous',
          color: user?.cursorColor || '#6366F1',
        },
      }),

      Placeholder.configure({
        placeholder: "Start writing… or press '/' for commands",
      }),

      CharacterCount,
    ],

    editorProps: {
      attributes: {
        // These classes style the editor's content area
        class: [
          'prose prose-invert prose-lg max-w-none',
          'min-h-[500px] px-2 py-4',
          'focus:outline-none',
          'text-[#E2E8F0] leading-relaxed',
        ].join(' '),
      },
    },

    // Emit cursor position to other users on every selection change
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      socket?.emit('cursor:update', {
        documentId,
        cursor: { from, to },
      });
    },

    // Emit typing indicator
    onUpdate: () => {
      socket?.emit('user:typing', { documentId, isTyping: true });
    },
  });

  // Destroy editor on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="relative">
      <TipTapContent editor={editor} />

      {/* Word count — bottom right of editor */}
      <div className="sticky bottom-4 flex justify-end pr-4 pointer-events-none">
        <span className="text-xs text-[#334155] bg-[#0F172A]/80 px-2 py-1 rounded-md">
          {editor.storage.characterCount?.words()} words
        </span>
      </div>
    </div>
  );
}