import { useState, useEffect, useRef } from 'react';
import kitchenBg from '@/assets/kitchen-counter-bg.jpg';
import { OnionSVG, TomatoSVG, CuttingBoardSVG, KitchenTimerSVG } from './KitchenIllustrations';
import CuttingBoardModal from './modals/CuttingBoardModal';
import OnionModal from './modals/OnionModal';
import TomatoModal from './modals/TomatoModal';
import TimerModal from './modals/TimerModal';
import { PrepSession } from '../hooks/usePrepSessions';
import { usePrepFiles } from '../hooks/usePrepFiles';

type Modal = 'board' | 'onion' | 'tomato' | 'timer' | null;
interface Countdown { days: number; hours: number; minutes: number; seconds: number; isPast: boolean; }

const calcCD = (iso: string | null): Countdown | null => {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000), isPast: false };
};

const Badge = ({ count, color, bg }: { count: number; color: string; bg: string }) => (
  <div style={{
    position: 'absolute', top: -6, right: -6,
    background: bg, color, fontWeight: 800, fontSize: 10,
    width: 20, height: 20, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
    border: '2px solid rgba(255,255,255,0.3)',
    lineHeight: 1, zIndex: 2,
  }}>
    {count}
  </div>
);

const TimerActiveDot = () => (
  <div style={{
    position: 'absolute', top: -4, right: -4,
    width: 12, height: 12, borderRadius: '50%',
    background: '#22C55E',
    boxShadow: '0 0 8px rgba(34,197,94,0.7)',
    border: '2px solid rgba(255,255,255,0.4)',
    zIndex: 2,
  }} />
);

const GoTimeDot = () => (
  <div className="animate-ping" style={{
    position: 'absolute', top: -4, right: -4,
    width: 12, height: 12, borderRadius: '50%',
    background: '#EF4444',
    boxShadow: '0 0 8px rgba(239,68,68,0.8)',
    border: '2px solid rgba(255,255,255,0.4)',
    zIndex: 2,
  }} />
);

const Obj = ({ children, label, onClick, style, badge }: { children: React.ReactNode; label: string; onClick: () => void; style?: React.CSSProperties; badge?: React.ReactNode }) => (
  <div onClick={onClick} style={{ position: 'absolute', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', ...style }}>
    <div className="group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-2" style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.4))', position: 'relative' }}>
        {children}
        {badge}
      </div>
      <div className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 ease-out" style={{ marginTop: 8, background: 'rgba(30,16,8,0.82)', color: '#F5EDD3', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap', backdropFilter: 'blur(4px)' }}>
        {label}
      </div>
    </div>
  </div>
);

const KitchenScene = ({ session }: { session: PrepSession }) => {
  const [modal, setModal] = useState<Modal>(null);
  const [meetingDt, setMeetingDt] = useState(session.meeting_datetime);
  const [countdown, setCountdown] = useState<Countdown | null>(calcCD(meetingDt));
  const interval = useRef<ReturnType<typeof setInterval>>();
  const { files } = usePrepFiles(session.id);

  useEffect(() => { setMeetingDt(session.meeting_datetime); }, [session.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    clearInterval(interval.current);
    setCountdown(calcCD(meetingDt));
    if (!meetingDt) return;
    interval.current = setInterval(() => setCountdown(calcCD(meetingDt)), 1000);
    return () => clearInterval(interval.current);
  }, [meetingDt]);

  const timerLabel = countdown
    ? countdown.isPast ? '🔔 Go Time!' : `${countdown.days > 0 ? countdown.days + 'd ' : ''}${countdown.hours}h ${countdown.minutes}m`
    : 'Set Timer';

  const talkingCount = session.talking_points.length;
  const fileCount = files.length;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Background */}
      <img src={kitchenBg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,10,4,0.08) 0%, rgba(20,10,4,0.15) 60%, rgba(20,10,4,0.3) 100%)' }} />

      {/* Onion — left */}
      <Obj
        label={fileCount > 0 ? `${fileCount} File${fileCount !== 1 ? 's' : ''}` : 'References'}
        onClick={() => setModal('onion')}
        style={{ left: '10%', bottom: '22%', transform: 'translateX(-50%)' }}
        badge={fileCount > 0 ? <Badge count={fileCount} color="#fff" bg="#7B3F9E" /> : undefined}
      >
        <OnionSVG className="w-24 animate-kitchen-bob hover:[animation-play-state:paused]" />
      </Obj>

      {/* Cutting Board — center */}
      <Obj label="Open Notes" onClick={() => setModal('board')} style={{ left: '50%', bottom: '14%', transform: 'translateX(-50%)' }}>
        <CuttingBoardSVG className="w-80" />
      </Obj>

      {/* Tomato — right of board */}
      <Obj
        label={talkingCount > 0 ? `${talkingCount} Point${talkingCount !== 1 ? 's' : ''}` : 'Agenda'}
        onClick={() => setModal('tomato')}
        style={{ right: '10%', bottom: '22%', transform: 'translateX(50%)' }}
        badge={talkingCount > 0 ? <Badge count={talkingCount} color="#fff" bg="#C0392B" /> : undefined}
      >
        <TomatoSVG className="w-24 animate-kitchen-bob-slow hover:[animation-play-state:paused]" />
      </Obj>

      {/* Timer — far right, further back */}
      <Obj
        label={timerLabel}
        onClick={() => setModal('timer')}
        style={{ right: '4%', bottom: '40%' }}
        badge={countdown ? (countdown.isPast ? <GoTimeDot /> : <TimerActiveDot />) : undefined}
      >
        <KitchenTimerSVG className="w-20 animate-kitchen-tick hover:[animation-play-state:paused]" isPast={countdown?.isPast} />
      </Obj>

      {/* Modals */}
      {modal === 'board' && <CuttingBoardModal key={session.id} sessionId={session.id} initialContent={session.rich_text_content} onClose={() => setModal(null)} />}
      {modal === 'onion' && <OnionModal sessionId={session.id} onClose={() => setModal(null)} />}
      {modal === 'tomato' && <TomatoModal key={session.id} sessionId={session.id} initialPoints={session.talking_points} onClose={() => setModal(null)} />}
      {modal === 'timer' && <TimerModal sessionId={session.id} initialDatetime={meetingDt} onClose={() => setModal(null)} onSave={(dt) => setMeetingDt(dt)} />}
    </div>
  );
};

export default KitchenScene;
