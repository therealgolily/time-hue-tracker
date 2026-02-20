import { useState, useEffect, useRef } from 'react';
import { Timer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface KitchenTimerProps {
  sessionId: string;
  initialDatetime: string | null;
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const calc = (target: Date): Countdown => {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    isPast: false,
  };
};

const KitchenTimer = ({ sessionId, initialDatetime }: KitchenTimerProps) => {
  const [datetime, setDatetime] = useState(
    initialDatetime ? new Date(initialDatetime).toISOString().slice(0, 16) : ''
  );
  const [isEditing, setIsEditing] = useState(!initialDatetime);
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (!datetime) { setCountdown(null); return; }
    const target = new Date(datetime);
    setCountdown(calc(target));
    intervalRef.current = setInterval(() => setCountdown(calc(target)), 1000);
    return () => clearInterval(intervalRef.current);
  }, [datetime]);

  const handleSave = async (value: string) => {
    setDatetime(value);
    setIsEditing(false);
    await db.from('prep_sessions').update({
      meeting_datetime: value ? new Date(value).toISOString() : null,
    }).eq('id', sessionId);
  };

  if (countdown?.isPast) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-lg flex-shrink-0"
        style={{ background: '#FFF3CD', border: '2px solid #B5651D' }}
      >
        <span className="text-lg">🔔</span>
        <div>
          <div className="font-bold text-xs uppercase tracking-widest" style={{ color: '#7A3F00' }}>
            Go Time!
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs underline"
            style={{ color: '#B5651D' }}
          >
            Reschedule
          </button>
        </div>
      </div>
    );
  }

  if (!datetime || isEditing) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg flex-shrink-0"
        style={{ background: '#FDF0DC', border: '1px solid #D4B896' }}
      >
        <Timer size={15} style={{ color: '#B5651D', flexShrink: 0 }} />
        <input
          type="datetime-local"
          defaultValue={datetime}
          onBlur={(e) => e.target.value && handleSave(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className="text-xs bg-transparent focus:outline-none"
          style={{ color: '#3D2B1F' }}
          autoFocus
        />
      </div>
    );
  }

  const { days, hours, minutes, seconds } = countdown!;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
      style={{ background: '#FDF0DC', border: '1px solid #D4B896' }}
      onClick={() => setIsEditing(true)}
      title="Click to change meeting time"
    >
      <Timer size={15} style={{ color: '#B5651D', flexShrink: 0 }} />
      <div className="font-mono text-xs flex gap-2" style={{ color: '#3D2B1F' }}>
        {days > 0 && <span><span className="font-bold">{days}</span>d</span>}
        {hours > 0 && <span><span className="font-bold">{hours}</span>h</span>}
        {minutes > 0 && <span><span className="font-bold">{minutes}</span>m</span>}
        <span><span className="font-bold">{seconds}</span>s</span>
      </div>
    </div>
  );
};

export default KitchenTimer;
