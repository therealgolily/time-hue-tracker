import { useState, useEffect, useRef } from 'react';
import kitchenBg from '@/assets/kitchen-counter-bg.jpg';
import onionImg from '@/assets/prep-onion.png';
import tomatoImg from '@/assets/prep-tomato.png';
import cuttingBoardImg from '@/assets/prep-cutting-board.png';
import timerImg from '@/assets/prep-timer.png';
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
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    isPast: false,
  };
};

interface ObjProps {
  src: string;
  label: string;
  onClick: () => void;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
  /** Tailwind animation class e.g. "animate-kitchen-bob" */
  animClass?: string;
}

const Obj = ({ src, label, onClick, style, imgStyle, animClass }: ObjProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...style,
      }}
    >
      {/* Lift wrapper — handles the pick-up offset */}
      <div
        style={{
          transform: hovered ? 'translateY(-14px)' : 'translateY(0)',
          transition: 'transform 0.2s ease-out',
        }}
      >
        <img
          src={src}
          draggable={false}
          className={animClass}
          style={{
            display: 'block',
            animationPlayState: hovered ? 'paused' : 'running',
            userSelect: 'none',
            ...imgStyle,
          }}
        />
      </div>

      {/* Contact shadow — tightens when grounded, spreads when lifted */}
      <div
        style={{
          width: hovered ? '88%' : '70%',
          height: hovered ? 14 : 9,
          background: 'rgba(8,3,0,0.75)',
          borderRadius: '50%',
          filter: hovered ? 'blur(18px)' : 'blur(8px)',
          opacity: hovered ? 0.28 : 0.55,
          marginTop: hovered ? -10 : -3,
          transition: 'all 0.2s ease-out',
          pointerEvents: 'none',
        }}
      />

      {/* Label — fades in on hover */}
      <div
        style={{
          marginTop: 10,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(5px)',
          transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
          background: 'rgba(30,16,8,0.84)',
          color: '#F5EDD3',
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          padding: '3px 10px',
          borderRadius: 20,
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(4px)',
          pointerEvents: 'none',
        }}
      >
        {label}
      </div>
    </div>
  );
};

const KitchenScene = ({ session }: { session: PrepSession }) => {
  const [modal, setModal] = useState<Modal>(null);
  const [meetingDt, setMeetingDt] = useState(session.meeting_datetime);
  const [countdown, setCountdown] = useState<Countdown | null>(calcCD(meetingDt));
  const interval = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => { setMeetingDt(session.meeting_datetime); }, [session.id]); // eslint-disable-line

  useEffect(() => {
    clearInterval(interval.current);
    setCountdown(calcCD(meetingDt));
    if (!meetingDt) return;
    interval.current = setInterval(() => setCountdown(calcCD(meetingDt)), 1000);
    return () => clearInterval(interval.current);
  }, [meetingDt]);

  const timerLabel = countdown
    ? countdown.isPast
      ? '🔔 Go Time!'
      : `${countdown.days > 0 ? countdown.days + 'd ' : ''}${countdown.hours}h ${countdown.minutes}m`
    : 'Set Timer';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Background */}
      <img
        src={kitchenBg}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,10,4,0.06) 0%, rgba(20,10,4,0.12) 55%, rgba(20,10,4,0.28) 100%)' }} />

      {/* Onion — left */}
      <Obj
        src={onionImg}
        label="References"
        onClick={() => setModal('onion')}
        animClass="animate-kitchen-bob"
        style={{ left: '12%', bottom: '18%', transform: 'translateX(-50%)' }}
        imgStyle={{ width: 140, height: 140, objectFit: 'contain' }}
      />

      {/* Cutting Board — center */}
      <Obj
        src={cuttingBoardImg}
        label="Open Notes"
        onClick={() => setModal('board')}
        style={{ left: '50%', bottom: '10%', transform: 'translateX(-50%)' }}
        imgStyle={{ width: 420, height: 240, objectFit: 'contain' }}
      />

      {/* Tomato — right of board */}
      <Obj
        src={tomatoImg}
        label="Agenda"
        onClick={() => setModal('tomato')}
        animClass="animate-kitchen-bob-slow"
        style={{ right: '12%', bottom: '18%', transform: 'translateX(50%)' }}
        imgStyle={{ width: 140, height: 140, objectFit: 'contain' }}
      />

      {/* Timer — far right, slightly back */}
      <Obj
        src={timerImg}
        label={timerLabel}
        onClick={() => setModal('timer')}
        animClass="animate-kitchen-tick"
        style={{ right: '5%', bottom: '34%' }}
        imgStyle={{ width: 110, height: 110, objectFit: 'contain' }}
      />

      {/* Modals */}
      {modal === 'board'  && <CuttingBoardModal key={session.id} sessionId={session.id} initialContent={session.rich_text_content} onClose={() => setModal(null)} />}
      {modal === 'onion'  && <OnionModal sessionId={session.id} onClose={() => setModal(null)} />}
      {modal === 'tomato' && <TomatoModal key={session.id} sessionId={session.id} initialPoints={session.talking_points} onClose={() => setModal(null)} />}
      {modal === 'timer'  && <TimerModal sessionId={session.id} initialDatetime={meetingDt} onClose={() => setModal(null)} onSave={(dt) => setMeetingDt(dt)} />}
    </div>
  );
};

export default KitchenScene;
