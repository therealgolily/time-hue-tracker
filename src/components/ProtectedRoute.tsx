import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTwoStepAuth } from '@/hooks/useTwoStepAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { authLevel, loading } = useTwoStepAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if (authLevel === 'none') {
      // Not authenticated at all - redirect to login
      navigate('/auth', { replace: true, state: { from: location.pathname } });
    } else if (authLevel === 'partial') {
      // Partial auth - redirect to PIN screen
      navigate('/pin', { replace: true, state: { from: location.pathname } });
    }
  }, [authLevel, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Only render children if fully authenticated
  if (authLevel !== 'full') {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
