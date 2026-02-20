import { useState, useEffect } from 'react';
import { usePrepSessions } from './hooks/usePrepSessions';
import SessionSidebar from './components/SessionSidebar';
import CuttingBoard from './components/CuttingBoard';
import Onion from './components/Onion';
import Tomato from './components/Tomato';
import KitchenTimer from './components/KitchenTimer';

const PrepApp = () => {
  const { sessions, isLoading, createSession, updateSession, deleteSession } = usePrepSessions();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  // Auto-select the first session on load
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  // Sync title input when session changes
  useEffect(() => {
    if (activeSession) setTitleValue(activeSession.title);
  }, [activeSession?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    const result = await createSession.mutateAsync('Untitled Session');
    setActiveSessionId(result.id);
  };

  const handleDelete = async (id: string) => {
    await deleteSession.mutateAsync(id);
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleTitleSave = () => {
    const title = titleValue.trim();
    if (activeSession && title) {
      updateSession.mutate({ id: activeSession.id, title });
    }
    setEditingTitle(false);
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#F5EDD3' }}
      >
        <span className="text-sm font-mono" style={{ color: '#B5651D' }}>
          Heating up the kitchen…
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#F5EDD3' }}>
      <SessionSidebar
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={setActiveSessionId}
        onCreate={handleCreate}
        onDelete={handleDelete}
        isCreating={createSession.isPending}
      />

      <main className="flex-1 flex flex-col overflow-hidden h-screen">
        {activeSession ? (
          <>
            {/* Top bar */}
            <div
              className="flex items-center gap-4 px-6 py-3 flex-shrink-0"
              style={{ background: '#EDE0C4', borderBottom: '1px solid #D4B896' }}
            >
              {/* Editable session title */}
              <div className="flex-1 min-w-0">
                {editingTitle ? (
                  <input
                    autoFocus
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                    className="text-lg font-bold bg-transparent border-b-2 focus:outline-none w-full max-w-sm"
                    style={{ color: '#2E1F14', borderColor: '#B5651D' }}
                  />
                ) : (
                  <h2
                    className="text-lg font-bold cursor-pointer truncate group flex items-center gap-2"
                    style={{ color: '#2E1F14' }}
                    onClick={() => setEditingTitle(true)}
                  >
                    {activeSession.title}
                    <span
                      className="text-xs font-normal opacity-0 group-hover:opacity-50 transition-opacity"
                      style={{ color: '#7A5230' }}
                    >
                      click to rename
                    </span>
                  </h2>
                )}
              </div>

              {/* Kitchen Timer */}
              <KitchenTimer
                key={activeSession.id}
                sessionId={activeSession.id}
                initialDatetime={activeSession.meeting_datetime}
              />
            </div>

            {/* Workspace: Onion | CuttingBoard | Tomato */}
            <div className="flex-1 flex gap-3 p-4 overflow-hidden">
              {/* Onion — file references */}
              <div className="w-52 flex-shrink-0 h-full">
                <Onion sessionId={activeSession.id} />
              </div>

              {/* Cutting Board — main notes */}
              <div className="flex-1 h-full min-w-0">
                <CuttingBoard
                  key={activeSession.id}
                  sessionId={activeSession.id}
                  initialContent={activeSession.rich_text_content}
                />
              </div>

              {/* Tomato — talking points */}
              <div className="w-52 flex-shrink-0 h-full">
                <Tomato
                  key={activeSession.id}
                  sessionId={activeSession.id}
                  initialPoints={activeSession.talking_points}
                />
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-10">
            <div className="text-6xl">🧑‍🍳</div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#2E1F14' }}>
                Your kitchen is empty
              </h2>
              <p className="text-sm mb-6" style={{ color: '#7A5230' }}>
                Create a prep session for your next meeting or call.
              </p>
              <button
                onClick={handleCreate}
                className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-widest transition-opacity hover:opacity-90"
                style={{ background: '#B5651D', color: '#F5EDD3' }}
              >
                + New Prep Session
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PrepApp;
