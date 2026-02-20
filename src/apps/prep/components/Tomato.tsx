import { useState, useRef } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TalkingPoint } from '../hooks/usePrepSessions';

interface TomatoProps {
  sessionId: string;
  initialPoints: TalkingPoint[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const Tomato = ({ sessionId, initialPoints }: TomatoProps) => {
  const [points, setPoints] = useState<TalkingPoint[]>(initialPoints);
  const [newText, setNewText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  const scheduleAutoSave = (updated: TalkingPoint[]) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await db.from('prep_sessions').update({ talking_points: updated }).eq('id', sessionId);
      } finally {
        setIsSaving(false);
      }
    }, 800);
  };

  const addPoint = () => {
    const text = newText.trim();
    if (!text) return;
    const updated = [...points, { id: crypto.randomUUID(), text }];
    setPoints(updated);
    setNewText('');
    scheduleAutoSave(updated);
  };

  const removePoint = (id: string) => {
    const updated = points.filter((p) => p.id !== id);
    setPoints(updated);
    scheduleAutoSave(updated);
  };

  const movePoint = (index: number, dir: 'up' | 'down') => {
    const arr = [...points];
    const swap = dir === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= arr.length) return;
    [arr[index], arr[swap]] = [arr[swap], arr[index]];
    setPoints(arr);
    scheduleAutoSave(arr);
  };

  const updatePoint = (id: string, text: string) => {
    const updated = points.map((p) => (p.id === id ? { ...p, text } : p));
    setPoints(updated);
    scheduleAutoSave(updated);
  };

  return (
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden shadow-lg"
      style={{ background: '#FDDEDE', border: '2px solid #E8B4B4' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #F0BFBF', background: '#FAC8C8' }}
      >
        <span className="text-lg">🍅</span>
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#7A1010' }}>
          Talking Points
        </h3>
        {isSaving && <Loader2 size={12} className="ml-auto animate-spin" style={{ color: '#C0392B' }} />}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {points.length === 0 && (
          <p className="text-xs text-center py-6" style={{ color: '#C08080' }}>
            No talking points yet
          </p>
        )}
        {points.map((point, index) => (
          <div key={point.id} className="flex items-start gap-1.5 group">
            <span
              className="text-xs font-bold mt-2 w-5 text-center flex-shrink-0"
              style={{ color: '#C0392B' }}
            >
              {index + 1}
            </span>
            <textarea
              value={point.text}
              onChange={(e) => updatePoint(point.id, e.target.value)}
              className="flex-1 text-xs resize-none rounded-md p-2 focus:outline-none transition-shadow"
              style={{
                background: '#FFF3F3',
                border: '1px solid #F0BFBF',
                color: '#3D1010',
                minHeight: '2.5rem',
              }}
              rows={1}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = t.scrollHeight + 'px';
              }}
            />
            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-1">
              <button
                onClick={() => movePoint(index, 'up')}
                disabled={index === 0}
                className="p-0.5 rounded hover:bg-[#F0BFBF] disabled:opacity-30"
              >
                <ChevronUp size={11} style={{ color: '#C0392B' }} />
              </button>
              <button
                onClick={() => movePoint(index, 'down')}
                disabled={index === points.length - 1}
                className="p-0.5 rounded hover:bg-[#F0BFBF] disabled:opacity-30"
              >
                <ChevronDown size={11} style={{ color: '#C0392B' }} />
              </button>
              <button
                onClick={() => removePoint(point.id)}
                className="p-0.5 rounded hover:bg-red-100"
              >
                <Trash2 size={11} style={{ color: '#C0392B' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid #F0BFBF' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPoint()}
            placeholder="Add a point…"
            className="flex-1 text-xs px-3 py-2 rounded-md focus:outline-none"
            style={{ background: '#FFF3F3', border: '1px solid #F0BFBF', color: '#3D1010' }}
          />
          <button
            onClick={addPoint}
            className="px-3 py-2 rounded-md flex-shrink-0"
            style={{ background: '#C0392B', color: '#fff' }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tomato;
