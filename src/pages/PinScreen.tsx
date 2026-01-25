import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTwoStepAuth } from '@/hooks/useTwoStepAuth';
import { Loader2, Shield } from 'lucide-react';

const PinScreen = () => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    authLevel, 
    loading: authLoading, 
    partialExpiresAt, 
    verifyPin, 
    signOut 
  } = useTwoStepAuth();

  // Redirect if not in partial auth state
  useEffect(() => {
    if (!authLoading) {
      if (authLevel === 'none') {
        navigate('/auth');
      } else if (authLevel === 'full') {
        navigate('/');
      }
    }
  }, [authLevel, authLoading, navigate]);

  // Countdown timer for partial auth expiry
  useEffect(() => {
    if (!partialExpiresAt) return;

    const updateTimer = () => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((partialExpiresAt.getTime() - now.getTime()) / 1000));
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        toast({
          title: 'Session expired',
          description: 'Please log in again.',
          variant: 'destructive',
        });
        signOut();
        navigate('/auth');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [partialExpiresAt, signOut, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pin.trim()) {
      toast({
        title: 'Invalid credentials',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const result = await verifyPin(pin);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      if (result.expired) {
        toast({
          title: 'Session expired',
          description: 'Please log in again.',
          variant: 'destructive',
        });
        await signOut();
        navigate('/auth');
      } else {
        toast({
          title: 'Invalid credentials',
          variant: 'destructive',
        });
        setPin('');
      }
    }
  };

  const handleCancel = async () => {
    await signOut();
    navigate('/auth');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-6">
          <Shield className="w-12 h-12 text-primary" />
        </div>
        
        <h1 className="text-2xl font-semibold text-foreground text-center mb-2">
          Security Verification
        </h1>
        
        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter your security PIN to continue
        </p>

        {timeRemaining !== null && (
          <div className="text-center mb-6">
            <span className="text-sm text-muted-foreground">
              Time remaining: <span className="font-mono font-medium text-foreground">{formatTime(timeRemaining)}</span>
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">Security PIN</Label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoFocus
              autoComplete="off"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Verify
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PinScreen;
