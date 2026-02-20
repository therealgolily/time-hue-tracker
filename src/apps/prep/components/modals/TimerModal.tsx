import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface Countdown { days: number; hours: number; minutes: number; seconds: number; isPast: boolean; }

const calc = (target: Date): Countdown => {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000), isPast: false };
};

interface Props { sessionId: string; initialDatetime: string | null; onClose: () => void; onSave: (dt: string | null) => void; }

const TimerModal = ({ sessionId, initialDatetime, onClose, onSave }: Props) => {
  const [datetime, setDatetime] = useState(initialDatetime ? new Date(initialDatetime).toISOString().slice(0, 16) : '');
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const interval = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    clearInterval(interval.current);
    if (!datetime) { setCountdown(null); return; }
    const t = new Date(datetime);
    setCountdown(calc(t));
    interval.current = setInterval(() => setCountdown(calc(t)), 1000);
    return () => clearInterval(interval.current);
  }, [datetime]);

  const handleSave = async () => {
    const iso = datetime ? new Date(datetime).toISOString() : null;
    await db.from('prep_sessions').update({ meeting_datetime: iso }).eq('id', sessionId);
    onSave(iso);
    onClose();
  };

  const handleClear = async () => {
    await db.from('prep_sessions').update({ meeting_datetime: null }).eq('id', sessionId);
    onSave(null);
    onClose();
  };

  const isPast = countdown?.isPast ?? false;

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'rgba(20,10,4,0.75)', backdropFilter: 'blur(6px)', zIndex: 50 }} onClick={onClose}>
      <div className="flex flex-col overflow-hidden animate-scale-in" style={{ width: 420, background: '#FDF0DC', borderRadius: 20, border: '3px solid #D4B896', boxShadow: '0 30px 70px rgba(0,0,0,0.55)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ background: '#EDD8B4', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, borderBottom: '1px solid #D4B896' }}>
          <span style={{ fontSize: 20 }}>⏱</span>
          <span style={{ color: '#5A3010', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Meeting Timer</span>
          <button onClick={onClose} style={{ marginLeft: 'auto', color: '#B5651D', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ color: '#5A3010', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Meeting Date &amp; Time</label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              style={{ width: '100%', background: '#FFF8EC', border: '2px solid #D4B896', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#3D2B1F', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          {countdown && !isPast && (
            <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid #E8D0A0', borderBottom: '1px solid #E8D0A0' }}>
              <div style={{ color: '#5A3010', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Countdown</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                {[{ v: countdown.days, l: 'Days' }, { v: countdown.hours, l: 'Hrs' }, { v: countdown.minutes, l: 'Min' }, { v: countdown.seconds, l: 'Sec' }].map(({ v, l }) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 800, color: '#B5651D', lineHeight: 1 }}>{String(v).padStart(2, '0')}</div>
                    <div style={{ color: '#9A7050', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isPast && (
            <div style={{ textAlign: 'center', padding: '16px 0', background: '#FFF3CD', borderRadius: 10 }}>
              <div style={{ fontSize: 28 }}>🔔</div>
              <div style={{ color: '#7A3F00', fontWeight: 800, fontSize: 14, marginTop: 4 }}>Go Time!</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            {initialDatetime && (
              <button onClick={handleClear} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '2px solid #D4B896', background: 'transparent', color: '#7A5030', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Clear Timer
              </button>
            )}
            <button onClick={handleSave} style={{ flex: 2, padding: '10px', borderRadius: 10, background: '#B5651D', color: '#F5EDD3', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Set Timer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerModal;
