import { useState, useEffect } from 'react';
import { usePrepSessions } from './hooks/usePrepSessions';
import SessionNav from './components/SessionNav';
import KitchenScene from './components/KitchenScene';

const PrepApp = () => {
  const { sessions, isLoading, createSession, updateSession, deleteSession } = usePrepSessions();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) setActiveSessionId(sessions[0].id);
  }, [sessions, activeSessionId]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

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

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5EDD3' }}>
        <span style={{ color: '#B5651D', fontFamily: 'monospace', fontSize: 14 }}>Heating up the kitchen…</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <SessionNav
        sessions={sessions}
        activeId={activeSessionId}
        activeSession={activeSession}
        onSelect={setActiveSessionId}
        onCreate={handleCreate}
        onDelete={handleDelete}
        onUpdateTitle={(title) => activeSession && updateSession.mutate({ id: activeSession.id, title })}
        isCreating={createSession.isPending}
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeSession ? (
          <KitchenScene session={activeSession} />
        ) : (
          <div style={{ minHeight: '100%', background: '#3D2B1F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <div style={{ fontSize: 64 }}>🧑‍🍳</div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: '#F5EDD3', fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>Your kitchen is empty</h2>
              <p style={{ color: '#D4B896', marginBottom: 24, fontSize: 14 }}>Create a prep session to get started.</p>
              <button onClick={handleCreate} disabled={createSession.isPending} style={{ background: '#B5651D', color: '#F5EDD3', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>
                + New Prep Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrepApp;
