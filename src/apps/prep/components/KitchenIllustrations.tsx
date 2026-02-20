import { useId } from 'react';

export const OnionSVG = ({ className = '' }: { className?: string }) => {
  const uid = useId().replace(/:/g, 'x');
  return (
    <svg viewBox="0 0 100 140" fill="none" className={className}>
      <ellipse cx="50" cy="133" rx="30" ry="7" fill="rgba(0,0,0,0.2)" />
      <path d="M 40 109 Q 50 114 60 109 Q 58 118 50 119 Q 42 118 40 109 Z" fill="#9A6818" />
      <path d="M 50 109 C 22 109 12 86 14 65 C 16 44 30 20 50 18 C 70 20 84 44 86 65 C 88 86 78 109 50 109 Z" fill={`url(#${uid}b)`} />
      <path d="M 50 101 C 27 101 18 81 20 64 C 22 47 34 26 50 25 C 66 26 78 47 80 64 C 82 81 73 101 50 101 Z" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <ellipse cx="33" cy="50" rx="9" ry="14" fill="rgba(255,255,255,0.22)" />
      <path d="M 18 78 Q 50 83 82 78" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
      <path d="M 15 62 Q 50 66 85 62" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
      <rect x="43" y="10" width="14" height="12" rx="4" fill={`url(#${uid}n)`} />
      <path d="M 44 13 C 40 2 36 -12 40 -26" stroke="#4A7C40" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 50 10 C 48 -3 47 -17 52 -31" stroke="#5A9248" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 56 13 C 60 2 64 -12 60 -26" stroke="#4A7C40" strokeWidth="3" fill="none" strokeLinecap="round" />
      <defs>
        <radialGradient id={`${uid}b`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#F5E4B2" />
          <stop offset="40%" stopColor="#D4A850" />
          <stop offset="80%" stopColor="#B08030" />
          <stop offset="100%" stopColor="#8A6018" />
        </radialGradient>
        <linearGradient id={`${uid}n`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0B848" />
          <stop offset="100%" stopColor="#B08820" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const TomatoSVG = ({ className = '' }: { className?: string }) => {
  const uid = useId().replace(/:/g, 'x');
  return (
    <svg viewBox="0 0 100 112" fill="none" className={className}>
      <ellipse cx="50" cy="106" rx="34" ry="7" fill="rgba(0,0,0,0.22)" />
      <circle cx="50" cy="56" r="44" fill={`url(#${uid}b)`} />
      <ellipse cx="34" cy="36" rx="12" ry="16" fill="rgba(255,255,255,0.24)" />
      <path d="M 36 95 Q 50 99 64 95" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
      {/* Calyx */}
      <path d="M 50 16 L 42 2 L 50 9" fill="#4A8030" />
      <path d="M 50 16 L 65 5 L 55 11" fill="#5A9040" />
      <path d="M 50 16 L 35 5 L 45 11" fill="#4A8030" />
      <path d="M 50 16 L 58 1 L 52 9" fill="#5A9040" />
      <path d="M 50 16 L 42 0 L 48 9" fill="#4A8030" />
      <path d="M 50 14 C 50 7 52 1 50 -5" stroke="#3D7028" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <defs>
        <radialGradient id={`${uid}b`} cx="38%" cy="33%" r="68%">
          <stop offset="0%" stopColor="#F06040" />
          <stop offset="45%" stopColor="#C82020" />
          <stop offset="100%" stopColor="#8B1010" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export const CuttingBoardSVG = ({ className = '' }: { className?: string }) => {
  const uid = useId().replace(/:/g, 'x');
  return (
    <svg viewBox="0 0 340 195" fill="none" className={className}>
      <ellipse cx="160" cy="189" rx="145" ry="7" fill="rgba(0,0,0,0.28)" />
      <rect x="8" y="10" width="280" height="168" rx="16" fill={`url(#${uid}b)`} />
      {[34, 54, 74, 96, 116, 136, 156, 170].map((y, i) => (
        <line key={i} x1="8" y1={y} x2="288" y2={y}
          stroke={i % 2 === 0 ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.07)'}
          strokeWidth={i % 2 === 0 ? 1.5 : 1} />
      ))}
      <rect x="8" y="10" width="280" height="168" rx="16" fill="none" stroke="rgba(255,210,140,0.2)" strokeWidth="2" />
      {/* Handle */}
      <rect x="280" y="68" width="48" height="54" rx="12" fill={`url(#${uid}h)`} />
      <line x1="283" y1="84" x2="325" y2="84" stroke="rgba(255,255,255,0.17)" strokeWidth="1" />
      <line x1="283" y1="95" x2="325" y2="95" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      <line x1="283" y1="106" x2="325" y2="106" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
      {/* Knife marks */}
      <line x1="55" y1="88" x2="210" y2="90" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />
      <line x1="55" y1="93" x2="180" y2="95" stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
      <text x="136" y="150" fill="rgba(255,255,255,0.22)" fontSize="12" fontFamily="Georgia, serif" textAnchor="middle" fontStyle="italic">tap to open notes</text>
      <defs>
        <linearGradient id={`${uid}b`} x1="0.1" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#D9AE58" />
          <stop offset="45%" stopColor="#B88838" />
          <stop offset="100%" stopColor="#8B6020" />
        </linearGradient>
        <linearGradient id={`${uid}h`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A07030" />
          <stop offset="100%" stopColor="#7A5018" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const KitchenTimerSVG = ({
  className = '',
  isPast = false,
}: {
  className?: string;
  isPast?: boolean;
}) => {
  const uid = useId().replace(/:/g, 'x');
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const inner = i % 3 === 0 ? 20 : 23;
    return { x1: 40 + Math.cos(angle) * inner, y1: 52 + Math.sin(angle) * inner, x2: 40 + Math.cos(angle) * 26, y2: 52 + Math.sin(angle) * 26, bold: i % 3 === 0 };
  });
  return (
    <svg viewBox="0 0 80 105" fill="none" className={className}>
      <ellipse cx="40" cy="99" rx="25" ry="6" fill="rgba(0,0,0,0.22)" />
      {/* Body */}
      <circle cx="40" cy="54" r="35" fill={`url(#${uid}b)`} />
      {/* Face */}
      <circle cx="40" cy="54" r="28" fill={isPast ? '#FFF8E0' : '#F8F8F4'} />
      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={isPast ? '#B5651D' : '#555'} strokeWidth={t.bold ? 2 : 1} strokeLinecap="round" />
      ))}
      {/* Hand */}
      <line x1="40" y1="54" x2="40" y2="32" stroke={isPast ? '#C0392B' : '#C0392B'} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="54" r="3" fill={isPast ? '#C0392B' : '#444'} />
      {/* Knob top */}
      <rect x="33" y="17" width="14" height="7" rx="3.5" fill="#909098" />
      <circle cx="40" cy="14" r="6" fill={`url(#${uid}k)`} />
      {/* Ring */}
      <circle cx="40" cy="54" r="33" fill="none" stroke={`url(#${uid}r)`} strokeWidth="3.5" />
      {/* Go time pulse ring */}
      {isPast && <circle cx="40" cy="54" r="33" fill="none" stroke="#C0392B" strokeWidth="2" opacity="0.4" />}
      <defs>
        <radialGradient id={`${uid}b`} cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#DCDCD4" />
          <stop offset="60%" stopColor="#AAAAA0" />
          <stop offset="100%" stopColor="#787870" />
        </radialGradient>
        <linearGradient id={`${uid}k`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EDD090" />
          <stop offset="100%" stopColor="#B5651D" />
        </linearGradient>
        <linearGradient id={`${uid}r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D8D8D0" />
          <stop offset="100%" stopColor="#909088" />
        </linearGradient>
      </defs>
    </svg>
  );
};
