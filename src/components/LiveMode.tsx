import { useState, useEffect, useCallback, useRef } from 'react';
import { format, differenceInSeconds, addMinutes, setHours, setMinutes } from 'date-fns';
import { Play, Clock, Timer, X, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useQuoteRotation } from '@/hooks/useQuoteRotation';
import { Quote } from '@/data/motivationalQuotes';

interface LiveModeProps {
  selectedDate: Date;
  onComplete: (startTime: Date, endTime: Date) => void;
  onCancel: () => void;
}

type TimerMode = 'duration' | 'time';
type DisplayPhase = 'setup' | 'quote' | 'running' | 'complete';

export const LiveMode = ({ selectedDate, onComplete, onCancel }: LiveModeProps) => {
  const [mode, setMode] = useState<TimerMode>('duration');
  const [durationMinutes, setDurationMinutes] = useState('25');
  const [targetTime, setTargetTime] = useState('');
  const [displayPhase, setDisplayPhase] = useState<DisplayPhase>('setup');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [quoteOpacity, setQuoteOpacity] = useState(0);
  const [timerOpacity, setTimerOpacity] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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
    // Get the quote for this session
    const quote = getQuoteAndAdvance();
    setCurrentQuote(quote);
    
    // Start the quote phase
    setDisplayPhase('quote');
    
    // Fade in the quote slowly
    setTimeout(() => setQuoteOpacity(1), 100);
    
    // After 4 seconds, start fading out quote
    setTimeout(() => {
      setQuoteOpacity(0);
    }, 4000);
    
    // Start showing timer while quote is almost gone (overlapping fade)
    setTimeout(() => {
      setDisplayPhase('running');
      // Small delay to ensure the component renders with opacity 0 first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimerOpacity(1);
        });
      });
      
      // NOW set the actual start/end times when timer becomes visible
      const now = new Date();
      let end: Date;
      if (mode === 'duration') {
        const mins = parseInt(durationMinutes) || 25;
        end = addMinutes(now, mins);
      } else {
        const [hours, mins] = targetTime.split(':').map(Number);
        end = setMinutes(setHours(selectedDate, hours), mins);
      }
      
      setStartTime(now);
      setEndTime(end);
      setSecondsRemaining(differenceInSeconds(end, now));
    }, 5000);
  };

  // Countdown timer
  useEffect(() => {
    if (displayPhase !== 'running' || !endTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const remaining = differenceInSeconds(endTime, now);

      if (remaining <= 0) {
        setSecondsRemaining(0);
        setDisplayPhase('complete');
        playNotificationSound();
        clearInterval(interval);
      } else {
        setSecondsRemaining(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [displayPhase, endTime, playNotificationSound]);

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
    : 0;

  // Show quote phase
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

  // Show completion state
  if (displayPhase === 'complete' && startTime) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-full bg-energy-positive/20 flex items-center justify-center mx-auto">
              <Volume2 className="w-10 h-10 text-energy-positive" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Time's Up!</h2>
            <p className="text-muted-foreground">
              Session completed at {format(new Date(), 'h:mm a')}
            </p>
          </div>

          <Button
            onClick={() => onComplete(startTime, new Date())}
            className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Log This Activity
          </Button>

          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Discard session
          </button>
        </div>
      </div>
    );
  }

  // Show running countdown
  if (displayPhase === 'running') {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary"
        >
          <X className="w-6 h-6" />
        </button>

        <div 
          className="w-full max-w-md space-y-8 text-center transition-opacity duration-1500 ease-in-out"
          style={{ opacity: timerOpacity, transitionDuration: '1.5s' }}
        >
          {/* Progress ring */}
          <div className="relative w-64 h-64 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 256 256">
              {/* Background circle */}
              <circle
                cx="128"
                cy="128"
                r="112"
                stroke="hsl(var(--secondary))"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="128"
                cy="128"
                r="112"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 112}
                strokeDashoffset={2 * Math.PI * 112 * (1 - progress)}
                transform="rotate(-90 128 128)"
                className="transition-all duration-100"
              />
            </svg>
            
            {/* Time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-mono font-bold text-foreground">
                {formatTime(secondsRemaining)}
              </span>
              <span className="text-sm text-muted-foreground mt-2">remaining</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground">
              Started at {startTime ? format(startTime, 'h:mm a') : '--'}
            </p>
            <p className="text-muted-foreground">
              Ends at {endTime ? format(endTime, 'h:mm a') : '--'}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setDisplayPhase('complete');
              playNotificationSound();
            }}
            className="border-border text-foreground"
          >
            End Early
          </Button>
        </div>
      </div>
    );
  }

  // Show setup screen
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
      <button
        onClick={onCancel}
        className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Live Mode</h2>
          <p className="text-muted-foreground">
            Start tracking an activity in real-time
          </p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('duration')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all',
              mode === 'duration'
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
            )}
          >
            <Timer className="w-5 h-5" />
            <span className="font-medium">Duration</span>
          </button>
          <button
            onClick={() => setMode('time')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all',
              mode === 'time'
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
            )}
          >
            <Clock className="w-5 h-5" />
            <span className="font-medium">End Time</span>
          </button>
        </div>

        {/* Input based on mode */}
        <div className="space-y-4">
          {mode === 'duration' ? (
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                How many minutes?
              </label>
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
          ) : (
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                End at what time?
              </label>
              <Input
                type="time"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                className="bg-secondary border-border font-mono text-center text-xl h-14"
              />
            </div>
          )}
        </div>

        <Button
          onClick={handleStart}
          disabled={mode === 'time' && !targetTime}
          className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Play className="w-5 h-5 mr-2" />
          Begin
        </Button>
      </div>
    </div>
  );
};
