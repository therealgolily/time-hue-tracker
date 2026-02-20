import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CuttingBoardProps {
  sessionId: string;
  initialContent: string | null;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const CuttingBoard = ({ sessionId, initialContent }: CuttingBoardProps) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: initialContent || '<p></p>',
    editorProps: {
      attributes: {
        class: 'prep-editor focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      clearTimeout(saveTimer.current);
      setSaveStatus('idle');
      saveTimer.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
          const { error } = await db
            .from('prep_sessions')
            .update({ rich_text_content: editor.getHTML() })
            .eq('id', sessionId);
          if (error) throw error;
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch {
          setSaveStatus('error');
        }
      }, 1500);
    },
  });

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const ToolBtn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className="p-1.5 rounded transition-colors"
      style={{
        background: active ? '#B5651D' : 'transparent',
        color: active ? '#F5EDD3' : '#5C3D1E',
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden shadow-lg"
      style={{ background: '#A0724A', border: '3px solid #7A5230' }}
    >
      {/* Wood header bar */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: '2px solid #7A5230', background: '#8B6040' }}
      >
        <span className="text-base">🪵</span>
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: '#F5EDD3' }}
        >
          Cutting Board
        </span>
        <div className="ml-auto text-xs font-mono" style={{ color: '#D4B896' }}>
          {saveStatus === 'saving' && '⟳ saving…'}
          {saveStatus === 'saved' && '✓ saved'}
          {saveStatus === 'error' && '✗ error'}
        </div>
      </div>

      {/* Toolbar */}
      {editor && (
        <div
          className="flex items-center gap-0.5 px-3 py-1.5"
          style={{ background: '#C8975A', borderBottom: '1px solid #A0724A' }}
        >
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
            <Bold size={13} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
            <Italic size={13} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
            <UnderlineIcon size={13} />
          </ToolBtn>
          <div className="w-px h-4 mx-1" style={{ background: '#A0724A' }} />
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
            <Heading1 size={13} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
            <Heading2 size={13} />
          </ToolBtn>
          <div className="w-px h-4 mx-1" style={{ background: '#A0724A' }} />
          <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
            <List size={13} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
            <ListOrdered size={13} />
          </ToolBtn>
        </div>
      )}

      {/* Paper surface on the wood */}
      <div
        className="flex-1 overflow-auto mx-3 mb-3 mt-2 rounded-lg"
        style={{ background: '#FFFDF5', border: '1px solid #D4B896' }}
      >
        <EditorContent editor={editor} className="h-full p-5" />
      </div>
    </div>
  );
};

export default CuttingBoard;
