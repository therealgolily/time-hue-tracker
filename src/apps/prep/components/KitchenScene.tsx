import { useState, useEffect, useRef } from 'react';
import kitchenBg from '@/assets/kitchen-counter-bg.jpg';
import { OnionSVG, TomatoSVG, CuttingBoardSVG, KitchenTimerSVG } from './KitchenIllustrations';
import CuttingBoardModal from './modals/CuttingBoardModal';
import OnionModal from './modals/OnionModal';
import TomatoModal from './modals/TomatoModal';
import TimerModal from './modals/TimerModal';
import { PrepSession } from '../hooks/usePrepSessions';

type Modal = 'board' | 'onion' | 'tomato' | 'timer' | null;
interface Countdown { days: number; hours: number; minutes: number; seconds: number; isPast: boolean; }

const calcCD = (iso: string | null): Countdown | null => {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000), isPast: false };
};

const Obj = ({ children, label, onClick, style }: { children: React.ReactNode; label: string; onClick: () => void; style?: React.CSSProperties }) => (
  <div onClick={onClick} style={{ position: 'absolute', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', ...style }}>
    <div className="group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-2" style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.4))' }}>
        {children}
      </div>
      <div style={{ marginTop: 8, background: 'rgba(30,16,8,0.82)', color: '#F5EDD3', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap', backdropFilter: 'blur(4px)' }}>
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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Background */}
      <img src={kitchenBg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,10,4,0.08) 0%, rgba(20,10,4,0.15) 60%, rgba(20,10,4,0.3) 100%)' }} />

      {/* Onion — left */}
      <Obj label="References" onClick={() => setModal('onion')} style={{ left: '10%', bottom: '22%', transform: 'translateX(-50%)' }}>
        <OnionSVG className="w-24 animate-kitchen-bob hover:[animation-play-state:paused]" />
      </Obj>

      {/* Cutting Board — center */}
      <Obj label="Open Notes" onClick={() => setModal('board')} style={{ left: '50%', bottom: '14%', transform: 'translateX(-50%)' }}>
        <CuttingBoardSVG className="w-80" />
      </Obj>

      {/* Tomato — right of board */}
      <Obj label="Agenda" onClick={() => setModal('tomato')} style={{ right: '10%', bottom: '22%', transform: 'translateX(50%)' }}>
        <TomatoSVG className="w-24 animate-kitchen-bob-slow hover:[animation-play-state:paused]" />
      </Obj>

      {/* Timer — far right, further back */}
      <Obj label={timerLabel} onClick={() => setModal('timer')} style={{ right: '4%', bottom: '40%' }}>
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
