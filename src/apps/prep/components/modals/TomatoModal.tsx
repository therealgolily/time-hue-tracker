import { useState, useRef } from 'react';
import { X, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { TalkingPoint } from '../../hooks/usePrepSessions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface Props { sessionId: string; initialPoints: TalkingPoint[]; onClose: () => void; }

const TomatoModal = ({ sessionId, initialPoints, onClose }: Props) => {
  const [points, setPoints] = useState<TalkingPoint[]>(initialPoints);
  const [newText, setNewText] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const queryClient = useQueryClient();

  const save = (updated: TalkingPoint[]) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await db.from('prep_sessions').update({ talking_points: updated }).eq('id', sessionId);
      queryClient.invalidateQueries({ queryKey: ['prep-sessions'] });
    }, 800);
  };

  const add = () => {
    if (!newText.trim()) return;
    const updated = [...points, { id: crypto.randomUUID(), text: newText.trim() }];
    setPoints(updated); setNewText(''); save(updated);
  };

  const remove = (id: string) => { const u = points.filter(p => p.id !== id); setPoints(u); save(u); };

  const move = (i: number, dir: 'up' | 'down') => {
    const arr = [...points]; const swap = dir === 'up' ? i - 1 : i + 1;
    if (swap < 0 || swap >= arr.length) return;
    [arr[i], arr[swap]] = [arr[swap], arr[i]]; setPoints(arr); save(arr);
  };

  const update = (id: string, text: string) => { const u = points.map(p => p.id === id ? { ...p, text } : p); setPoints(u); save(u); };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'rgba(20,10,4,0.75)', backdropFilter: 'blur(6px)', zIndex: 50 }} onClick={onClose}>
      <div className="flex flex-col overflow-hidden animate-scale-in" style={{ width: 540, maxHeight: '82vh', background: '#FDDEDE', borderRadius: 20, border: '3px solid #F0B8B8', boxShadow: '0 30px 70px rgba(0,0,0,0.55)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ background: '#FAC8C8', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, borderBottom: '1px solid #F0B8B8' }}>
          <span style={{ fontSize: 20 }}>🍅</span>
          <span style={{ color: '#7A1010', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Talking Points</span>
          <button onClick={onClose} style={{ marginLeft: 'auto', color: '#C0392B', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {points.length === 0 && <p style={{ color: '#C08080', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>No talking points yet</p>}
          {points.map((pt, i) => (
            <div key={pt.id} className="group flex items-start gap-2" style={{ marginBottom: 8 }}>
              <span style={{ color: '#C0392B', fontWeight: 800, fontSize: 12, marginTop: 8, width: 18, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
              <textarea
                value={pt.text}
                onChange={(e) => update(pt.id, e.target.value)}
                style={{ flex: 1, background: '#FFF3F3', border: '1px solid #F0B8B8', borderRadius: 8, padding: '6px 10px', fontSize: 13, color: '#3D1010', resize: 'none', outline: 'none', minHeight: 36, fontFamily: 'inherit' }}
                rows={1}
                onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }}
              />
              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pt-1 flex-shrink-0">
                <button onClick={() => move(i, 'up')} disabled={i === 0} style={{ padding: 2, borderRadius: 3, background: 'transparent', border: 'none', cursor: 'pointer', color: '#C0392B', opacity: i === 0 ? 0.3 : 1 }}><ChevronUp size={12} /></button>
                <button onClick={() => move(i, 'down')} disabled={i === points.length - 1} style={{ padding: 2, borderRadius: 3, background: 'transparent', border: 'none', cursor: 'pointer', color: '#C0392B', opacity: i === points.length - 1 ? 0.3 : 1 }}><ChevronDown size={12} /></button>
                <button onClick={() => remove(pt.id)} style={{ padding: 2, borderRadius: 3, background: 'transparent', border: 'none', cursor: 'pointer', color: '#C0392B' }}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: 12, borderTop: '1px solid #F0B8B8', flexShrink: 0, display: 'flex', gap: 8 }}>
          <input
            type="text" value={newText} onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Add a talking point…"
            style={{ flex: 1, background: '#FFF3F3', border: '1px solid #F0B8B8', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#3D1010', outline: 'none', fontFamily: 'inherit' }}
          />
          <button onClick={add} style={{ background: '#C0392B', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TomatoModal;
