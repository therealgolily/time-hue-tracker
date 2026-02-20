import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, ChevronDown, Trash2 } from 'lucide-react';
import { PrepSession } from '../hooks/usePrepSessions';
import { format } from 'date-fns';

interface SessionNavProps {
  sessions: PrepSession[];
  activeId: string | null;
  activeSession: PrepSession | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onUpdateTitle: (title: string) => void;
  isCreating: boolean;
}

const SessionNav = ({
  sessions, activeId, activeSession, onSelect, onCreate, onDelete, onUpdateTitle, isCreating,
}: SessionNavProps) => {
  const [open, setOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState('');

  const startEdit = () => {
    setTitleVal(activeSession?.title ?? '');
    setEditingTitle(true);
    setOpen(false);
  };

  const commitTitle = () => {
    if (titleVal.trim()) onUpdateTitle(titleVal.trim());
    setEditingTitle(false);
  };

  return (
    <div
      className="flex items-center gap-3 px-4 flex-shrink-0"
      style={{ height: 48, background: 'rgba(30,16,8,0.92)', backdropFilter: 'blur(6px)', borderBottom: '1px solid rgba(212,184,150,0.15)', zIndex: 40, position: 'relative' }}
    >
      <Link to="/" className="flex items-center gap-1.5 transition-opacity hover:opacity-70 flex-shrink-0">
        <ArrowLeft size={14} style={{ color: '#D4B896' }} />
        <span style={{ color: '#D4B896', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hub</span>
      </Link>

      <div style={{ width: 1, height: 20, background: 'rgba(212,184,150,0.2)' }} />

      {/* Editable session title */}
      <div className="flex-1 min-w-0">
        {editingTitle ? (
          <input
            autoFocus
            value={titleVal}
            onChange={(e) => setTitleVal(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => e.key === 'Enter' && commitTitle()}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#F5EDD3', fontSize: 13, fontWeight: 600, width: '100%', maxWidth: 300 }}
          />
        ) : (
          <button
            onClick={startEdit}
            style={{ color: '#F5EDD3', fontSize: 13, fontWeight: 600, background: 'transparent', border: 'none', cursor: 'text', textAlign: 'left', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {activeSession?.title ?? 'No session'}
          </button>
        )}
      </div>

      {/* Session picker */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
          style={{ color: '#D4B896', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(212,184,150,0.1)', border: '1px solid rgba(212,184,150,0.2)', padding: '4px 10px', borderRadius: 6 }}
        >
          Sessions
          <ChevronDown size={12} />
        </button>
        {open && (
          <div
            style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#1E1008', border: '1px solid rgba(212,184,150,0.2)', borderRadius: 10, minWidth: 220, boxShadow: '0 16px 40px rgba(0,0,0,0.5)', zIndex: 100, overflow: 'hidden' }}
          >
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors hover:bg-white/5"
                  style={{ borderLeft: s.id === activeId ? '3px solid #B5651D' : '3px solid transparent' }}
                  onClick={() => { onSelect(s.id); setOpen(false); }}
                >
                  <div className="flex-1 min-w-0">
                    <div style={{ color: '#F5EDD3', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                    <div style={{ color: 'rgba(212,184,150,0.5)', fontSize: 10 }}>{format(new Date(s.updated_at), 'MMM d')}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-900/30"
                  >
                    <Trash2 size={11} style={{ color: '#D4B896' }} />
                  </button>
                </div>
              ))}
              {sessions.length === 0 && (
                <div style={{ color: 'rgba(212,184,150,0.4)', fontSize: 12, padding: '12px 16px' }}>No sessions yet</div>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onCreate}
        disabled={isCreating}
        className="flex items-center gap-1.5 transition-opacity hover:opacity-90 disabled:opacity-50 flex-shrink-0"
        style={{ background: '#B5651D', color: '#F5EDD3', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '5px 12px', borderRadius: 6 }}
      >
        <Plus size={13} />
        New
      </button>
    </div>
  );
};

export default SessionNav;
