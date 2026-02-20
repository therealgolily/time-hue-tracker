import { useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { X, Bold, Italic, Underline as UIcon, Heading1, Heading2, List, ListOrdered, ImagePlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface Props {
  sessionId: string;
  initialContent: string | null;
  onClose: () => void;
}

const CuttingBoardModal = ({ sessionId, initialContent, onClose }: Props) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [uploading, setUploading] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content: initialContent || '<p></p>',
    editorProps: { attributes: { class: 'prep-editor focus:outline-none' } },
    onUpdate: ({ editor }) => {
      clearTimeout(saveTimer.current);
      setSaveStatus('idle');
      saveTimer.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
          await db.from('prep_sessions').update({ rich_text_content: editor.getHTML() }).eq('id', sessionId);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch { setSaveStatus('error'); }
      }, 1200);
    },
  });

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `notes-images/${sessionId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('prep-files').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('prep-files').getPublicUrl(path);
      editor.chain().focus().setImage({ src: data.publicUrl }).run();
    } catch (err) {
      console.error('Image upload failed', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const Btn = ({ onClick, active, title, children }: { onClick: () => void; active: boolean; title: string; children: React.ReactNode }) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      style={{ padding: '5px 6px', borderRadius: 4, background: active ? '#B5651D' : 'transparent', color: active ? '#F5EDD3' : '#C8904A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
    >
      {children}
    </button>
  );

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgba(20,10,4,0.78)', backdropFilter: 'blur(6px)', zIndex: 50 }}
      onClick={onClose}
    >
      <div
        className="flex flex-col overflow-hidden animate-scale-in"
        style={{ width: '92vw', maxWidth: 1080, height: '88vh', background: '#8B5E2A', borderRadius: 20, border: '4px solid #6A4010', boxShadow: '0 40px 90px rgba(0,0,0,0.65)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Wood header */}
        <div style={{ background: '#6A4010', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>🪵</span>
          <span style={{ color: '#F5EDD3', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Notes</span>
          {editor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 12 }}>
              <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={13} /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={13} /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UIcon size={13} /></Btn>
              <div style={{ width: 1, height: 16, background: 'rgba(212,184,150,0.3)', margin: '0 4px' }} />
              <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1"><Heading1 size={13} /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2"><Heading2 size={13} /></Btn>
              <div style={{ width: 1, height: 16, background: 'rgba(212,184,150,0.3)', margin: '0 4px' }} />
              <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullets"><List size={13} /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered"><ListOrdered size={13} /></Btn>
              <div style={{ width: 1, height: 16, background: 'rgba(212,184,150,0.3)', margin: '0 4px' }} />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <Btn onClick={() => fileInputRef.current?.click()} active={false} title="Insert image">
                {uploading ? <span style={{ fontSize: 10, color: '#C8904A' }}>…</span> : <ImagePlus size={13} />}
              </Btn>
            </div>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(212,184,150,0.7)' }}>
              {saveStatus === 'saving' && '⟳ saving…'}
              {saveStatus === 'saved' && '✓ saved'}
              {saveStatus === 'error' && '✗ error'}
            </span>
            <button onClick={onClose} style={{ color: '#D4B896', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
              <X size={18} />
            </button>
          </div>
        </div>
        {/* Paper surface */}
        <div style={{ flex: 1, background: '#FFFDF7', margin: 12, borderRadius: 12, overflow: 'auto' }}>
          <EditorContent editor={editor} className="h-full p-6" />
        </div>
      </div>
    </div>
  );
};

export default CuttingBoardModal;
