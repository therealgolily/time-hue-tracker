import { useState, useEffect, useCallback, useRef } from 'react';
import { format, differenceInSeconds, addMinutes, setHours, setMinutes } from 'date-fns';
import { Play, Clock, Timer, X, Infinity, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useQuoteRotation } from '@/hooks/useQuoteRotation';
import { Quote } from '@/data/motivationalQuotes';
import { ClientLiveSegment } from '@/types/clientTracker';

interface ClientTrackerLiveModeProps {
  selectedDate: Date;
  onComplete: (segments: ClientLiveSegment[]) => void;
  onCancel: () => void;
}

type TimerMode = 'duration' | 'time' | 'open';
type DisplayPhase = 'setup' | 'quote' | 'running' | 'complete' | 'break-setup' | 'on-break';
type BreakMode = 'duration' | 'time' | 'open';

export const ClientTrackerLiveMode = ({ selectedDate, onComplete, onCancel }: ClientTrackerLiveModeProps) => {
  const [mode, setMode] = useState<TimerMode>('duration');
  const [durationMinutes, setDurationMinutes] = useState('25');
  const [targetTime, setTargetTime] = useState('');
  const [displayPhase, setDisplayPhase] = useState<DisplayPhase>('setup');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [quoteOpacity, setQuoteOpacity] = useState(0);
  const [timerOpacity, setTimerOpacity] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Break state
  const [segments, setSegments] = useState<ClientLiveSegment[]>([]);
  const [currentSegmentStart, setCurrentSegmentStart] = useState<Date | null>(null);
  const [breakMode, setBreakMode] = useState<BreakMode>('open');
  const [breakDurationMinutes, setBreakDurationMinutes] = useState('10');
  const [breakTargetTime, setBreakTargetTime] = useState('');
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [breakEndTime, setBreakEndTime] = useState<Date | null>(null);
  const [breakSecondsRemaining, setBreakSecondsRemaining] = useState(0);
  const [breakSecondsElapsed, setBreakSecondsElapsed] = useState(0);
  
  const { getQuoteAndAdvance } = useQuoteRotation();

  // Create audio context for notification
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playBeep = (startTime: number, frequency: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    playBeep(now, 880, 0.2);
    playBeep(now + 0.25, 880, 0.2);
    playBeep(now + 0.5, 1100, 0.4);
  }, []);

  const handleStart = () => {
    const quote = getQuoteAndAdvance();
    setCurrentQuote(quote);
    setDisplayPhase('quote');
    setTimeout(() => setQuoteOpacity(1), 100);
    setTimeout(() => setQuoteOpacity(0), 4000);
    
    setTimeout(() => {
      setDisplayPhase('running');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimerOpacity(1);
        });
      });
      
      const now = new Date();
      setStartTime(now);
      setCurrentSegmentStart(now);
      
      if (mode === 'open') {
        setEndTime(null);
        setSecondsElapsed(0);
      } else {
        let end: Date;
        if (mode === 'duration') {
          const mins = parseInt(durationMinutes) || 25;
          end = addMinutes(now, mins);
        } else {
          const [hours, mins] = targetTime.split(':').map(Number);
          end = setMinutes(setHours(selectedDate, hours), mins);
        }
        setEndTime(end);
        setSecondsRemaining(differenceInSeconds(end, now));
      }
    }, 5000);
  };

  const handleTakeBreak = () => {
    if (currentSegmentStart) {
      const now = new Date();
      setSegments(prev => [...prev, {
        startTime: currentSegmentStart,
        endTime: now,
        isBreak: false
      }]);
    }
    setBreakMode('open');
    setBreakDurationMinutes('10');
    setBreakTargetTime('');
    setDisplayPhase('break-setup');
  };

  const handleStartBreak = () => {
    const now = new Date();
    setBreakStartTime(now);
    
    if (breakMode === 'open') {
      setBreakEndTime(null);
      setBreakSecondsElapsed(0);
    } else {
      let end: Date;
      if (breakMode === 'duration') {
        const mins = parseInt(breakDurationMinutes) || 10;
        end = addMinutes(now, mins);
      } else {
        const [hours, mins] = breakTargetTime.split(':').map(Number);
        end = setMinutes(setHours(new Date(), hours), mins);
      }
      setBreakEndTime(end);
      setBreakSecondsRemaining(differenceInSeconds(end, now));
    }
    
    setDisplayPhase('on-break');
  };

  const handleResumeFromBreak = () => {
    if (breakStartTime) {
      const now = new Date();
      setSegments(prev => [...prev, {
        startTime: breakStartTime,
        endTime: now,
        isBreak: true
      }]);
    }
    setCurrentSegmentStart(new Date());
    setBreakStartTime(null);
    setBreakEndTime(null);
    setDisplayPhase('running');
  };

  const handleComplete = () => {
    const now = new Date();
    const allSegments: ClientLiveSegment[] = [...segments];
    
    if (currentSegmentStart) {
      allSegments.push({
        startTime: currentSegmentStart,
        endTime: now,
        isBreak: false
      });
    }
    
    playNotificationSound();
    onComplete(allSegments);
  };

  // Countdown timer
  useEffect(() => {
    if (displayPhase !== 'running' || !endTime) return;
    const interval = setInterval(() => {
      const now = new Date();
      const remaining = differenceInSeconds(endTime, now);
      if (remaining <= 0) {
        setSecondsRemaining(0);
        handleComplete();
        clearInterval(interval);
      } else {
        setSecondsRemaining(remaining);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [displayPhase, endTime]);

  // Count-up timer
  useEffect(() => {
    if (displayPhase !== 'running' || !startTime || endTime !== null) return;
    const interval = setInterval(() => {
      const now = new Date();
      setSecondsElapsed(differenceInSeconds(now, startTime));
    }, 100);
    return () => clearInterval(interval);
  }, [displayPhase, startTime, endTime]);

  // Break countdown
  useEffect(() => {
    if (displayPhase !== 'on-break' || !breakEndTime) return;
    const interval = setInterval(() => {
      const now = new Date();
      const remaining = differenceInSeconds(breakEndTime, now);
      if (remaining <= 0) {
        setBreakSecondsRemaining(0);
        playNotificationSound();
      } else {
        setBreakSecondsRemaining(remaining);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [displayPhase, breakEndTime, playNotificationSound]);

  // Break count-up
  useEffect(() => {
    if (displayPhase !== 'on-break' || !breakStartTime || breakEndTime !== null) return;
    const interval = setInterval(() => {
      const now = new Date();
      setBreakSecondsElapsed(differenceInSeconds(now, breakStartTime));
    }, 100);
    return () => clearInterval(interval);
  }, [displayPhase, breakStartTime, breakEndTime]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = endTime && startTime
    ? 1 - (secondsRemaining / differenceInSeconds(endTime, startTime))
    : null;

  // Quote phase
  if (displayPhase === 'quote' && currentQuote) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center p-8">
        <div 
          className="max-w-2xl text-center transition-opacity duration-1000 ease-in-out"
          style={{ opacity: quoteOpacity }}
        >
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-light text-white leading-relaxed mb-6 italic">
            "{currentQuote.text}"
          </blockquote>
          <cite className="text-lg md:text-xl text-zinc-400 not-italic">
            — {currentQuote.author}
          </cite>
        </div>
      </div>
    );
  }

  // Break setup
  if (displayPhase === 'break-setup') {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
        <button
          onClick={() => setDisplayPhase('running')}
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-energy-neutral/20 flex items-center justify-center mx-auto mb-4">
              <Coffee className="w-8 h-8 text-energy-neutral" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Take a Break</h2>
            <p className="text-muted-foreground">How long will you be away?</p>
          </div>
          <div className="flex gap-2">
            {(['duration', 'time', 'open'] as BreakMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setBreakMode(m)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all',
                  breakMode === m
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
                )}
              >
                {m === 'duration' && <Timer className="w-5 h-5" />}
                {m === 'time' && <Clock className="w-5 h-5" />}
                {m === 'open' && <Infinity className="w-5 h-5" />}
                <span className="font-medium text-sm capitalize">{m === 'time' ? 'Resume At' : m}</span>
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {breakMode === 'duration' && (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Break for how many minutes?</label>
                <div className="flex gap-2">
                  {['5', '10', '15', '30'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setBreakDurationMinutes(preset)}
                      className={cn(
                        'flex-1 py-3 rounded-lg border-2 font-mono font-medium transition-all',
                        breakDurationMinutes === preset
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={breakDurationMinutes}
                  onChange={(e) => setBreakDurationMinutes(e.target.value)}
                  placeholder="Custom minutes..."
                  className="bg-secondary border-border font-mono text-center text-xl h-14"
                  min="1"
                  max="480"
                />
              </div>
            )}
            {breakMode === 'time' && (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Resume at what time?</label>
                <Input
                  type="time"
                  value={breakTargetTime}
                  onChange={(e) => setBreakTargetTime(e.target.value)}
                  className="bg-secondary border-border font-mono text-center text-xl h-14"
                />
              </div>
            )}
            {breakMode === 'open' && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Take as long as you need. Resume when ready.</p>
              </div>
            )}
          </div>
          <Button
            onClick={handleStartBreak}
            disabled={breakMode === 'time' && !breakTargetTime}
            className="w-full h-14 text-lg bg-energy-neutral hover:bg-energy-neutral/90 text-white"
          >
            <Coffee className="w-5 h-5 mr-2" />
            Start Break
          </Button>
        </div>
      </div>
    );
  }

  // On break
  if (displayPhase === 'on-break') {
    const isOpenBreak = breakEndTime === null;
    const breakTimerDone = !isOpenBreak && breakSecondsRemaining <= 0;
    
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="relative w-64 h-64 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 256 256">
              <circle cx="128" cy="128" r="112" stroke="hsl(var(--secondary))" strokeWidth="8" fill="none" />
              <circle cx="128" cy="128" r="112" stroke="hsl(var(--energy-neutral))" strokeWidth="8" fill="none" strokeLinecap="round" className={cn("animate-pulse", breakTimerDone && "animate-bounce")} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Coffee className="w-8 h-8 text-energy-neutral mb-2" />
              <span className="text-4xl font-mono font-bold text-foreground">
                {isOpenBreak ? formatTime(breakSecondsElapsed) : formatTime(breakSecondsRemaining)}
              </span>
              <span className="text-sm text-muted-foreground mt-2">
                {breakTimerDone ? 'Break ended!' : isOpenBreak ? 'on break' : 'break remaining'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground">Break started at {breakStartTime ? format(breakStartTime, 'h:mm a') : '--'}</p>
            {!isOpenBreak && !breakTimerDone && (
              <p className="text-muted-foreground">Resume at {breakEndTime ? format(breakEndTime, 'h:mm a') : '--'}</p>
            )}
          </div>
          <Button
            onClick={handleResumeFromBreak}
            className={cn(
              "w-full h-14 text-lg",
              breakTimerDone 
                ? "bg-energy-positive hover:bg-energy-positive/90 text-white animate-pulse"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            <Play className="w-5 h-5 mr-2" />
            Resume Working
          </Button>
        </div>
      </div>
    );
  }

  // Running timer
  if (displayPhase === 'running') {
    const isOpenMode = endTime === null;
    
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
        <button onClick={onCancel} className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary">
          <X className="w-6 h-6" />
        </button>
        <div className="w-full max-w-md space-y-8 text-center transition-opacity duration-1500 ease-in-out" style={{ opacity: timerOpacity, transitionDuration: '1.5s' }}>
          <div className="relative w-64 h-64 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 256 256">
              <circle cx="128" cy="128" r="112" stroke="hsl(var(--secondary))" strokeWidth="8" fill="none" />
              {progress !== null && (
                <circle cx="128" cy="128" r="112" stroke="hsl(var(--primary))" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * 112} strokeDashoffset={2 * Math.PI * 112 * (1 - progress)} transform="rotate(-90 128 128)" className="transition-all duration-100" />
              )}
              {isOpenMode && <circle cx="128" cy="128" r="112" stroke="hsl(var(--primary))" strokeWidth="8" fill="none" strokeLinecap="round" className="animate-pulse" />}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-mono font-bold text-foreground">
                {isOpenMode ? formatTime(secondsElapsed) : formatTime(secondsRemaining)}
              </span>
              <span className="text-sm text-muted-foreground mt-2">{isOpenMode ? 'elapsed' : 'remaining'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground">Started at {startTime ? format(startTime, 'h:mm a') : '--'}</p>
            {!isOpenMode && <p className="text-muted-foreground">Ends at {endTime ? format(endTime, 'h:mm a') : '--'}</p>}
            {segments.length > 0 && <p className="text-xs text-muted-foreground/60">{segments.filter(s => s.isBreak).length} break(s) taken</p>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleTakeBreak} className="flex-1 border-border text-foreground hover:bg-energy-neutral/10">
              <Coffee className="w-4 h-4 mr-2" />
              Take a Break
            </Button>
            <Button variant={isOpenMode ? 'default' : 'outline'} onClick={handleComplete} className={cn("flex-1", isOpenMode ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'border-border text-foreground')}>
              {isOpenMode ? 'Stop Tracking' : 'End Early'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Setup screen
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
      <button onClick={onCancel} className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary">
        <X className="w-6 h-6" />
      </button>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Live Mode</h2>
          <p className="text-muted-foreground">Start tracking an activity in real-time</p>
        </div>
        <div className="flex gap-2">
          {(['duration', 'time', 'open'] as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all',
                mode === m
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
              )}
            >
              {m === 'duration' && <Timer className="w-5 h-5" />}
              {m === 'time' && <Clock className="w-5 h-5" />}
              {m === 'open' && <Infinity className="w-5 h-5" />}
              <span className="font-medium text-sm capitalize">{m === 'time' ? 'End Time' : m}</span>
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {mode === 'duration' && (
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">How many minutes?</label>
              <div className="flex gap-2">
                {['15', '25', '45', '60'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setDurationMinutes(preset)}
                    className={cn(
                      'flex-1 py-3 rounded-lg border-2 font-mono font-medium transition-all',
                      durationMinutes === preset
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <Input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="Custom minutes..."
                className="bg-secondary border-border font-mono text-center text-xl h-14"
                min="1"
                max="480"
              />
            </div>
          )}
          {mode === 'time' && (
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">End at what time?</label>
              <Input type="time" value={targetTime} onChange={(e) => setTargetTime(e.target.value)} className="bg-secondary border-border font-mono text-center text-xl h-14" />
            </div>
          )}
          {mode === 'open' && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Track indefinitely until you choose to stop.</p>
            </div>
          )}
        </div>
        <Button onClick={handleStart} disabled={mode === 'time' && !targetTime} className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground">
          <Play className="w-5 h-5 mr-2" />
          {mode === 'open' ? 'Start Tracking' : 'Begin'}
        </Button>
      </div>
    </div>
  );
};
