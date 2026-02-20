import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PrepSession } from '../hooks/usePrepSessions';
import { format } from 'date-fns';

interface SessionSidebarProps {
  sessions: PrepSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  isCreating: boolean;
}

const SessionSidebar = ({
  sessions,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  isCreating,
}: SessionSidebarProps) => {
  return (
    <div
      className="flex flex-col w-56 flex-shrink-0 h-screen overflow-hidden"
      style={{ background: '#2E1F14' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(212,184,150,0.15)' }}
      >
        <Link to="/" className="p-1 rounded transition-opacity hover:opacity-70">
          <ArrowLeft size={15} style={{ color: '#D4B896' }} />
        </Link>
        <span className="text-xl">🧑‍🍳</span>
        <span
          className="text-sm font-black uppercase tracking-widest"
          style={{ color: '#F5EDD3' }}
        >
          Prep
        </span>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto py-2">
        {sessions.length === 0 && (
          <p className="text-xs px-4 py-4" style={{ color: 'rgba(212,184,150,0.4)' }}>
            No sessions yet
          </p>
        )}
        {sessions.map((session) => {
          const isActive = session.id === activeId;
          return (
            <div
              key={session.id}
              className="group flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-colors"
              style={{
                background: isActive ? 'rgba(181,101,29,0.25)' : 'transparent',
                borderLeft: isActive ? '3px solid #B5651D' : '3px solid transparent',
              }}
              onClick={() => onSelect(session.id)}
            >
              <div className="flex-1 min-w-0">
                <div
                  className="text-xs font-semibold truncate"
                  style={{ color: isActive ? '#F5EDD3' : 'rgba(245,237,211,0.8)' }}
                >
                  {session.title}
                </div>
                <div className="text-xs truncate" style={{ color: 'rgba(212,184,150,0.5)' }}>
                  {format(new Date(session.updated_at), 'MMM d')}
                  {session.meeting_datetime &&
                    ` · ${format(new Date(session.meeting_datetime), 'h:mm a')}`}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-900/30 flex-shrink-0"
              >
                <Trash2 size={11} style={{ color: '#D4B896' }} />
              </button>
            </div>
          );
        })}
      </div>

      {/* New Session */}
      <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(212,184,150,0.15)' }}>
        <button
          onClick={onCreate}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: '#B5651D', color: '#F5EDD3' }}
        >
          <Plus size={14} />
          New Session
        </button>
      </div>
    </div>
  );
};

export default SessionSidebar;
