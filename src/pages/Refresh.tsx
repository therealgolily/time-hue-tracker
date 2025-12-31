import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RefreshHome from '@/components/RefreshHome';
import RefreshReflectionFlow from '@/components/RefreshReflectionFlow';
import RefreshPastReflection from '@/components/RefreshPastReflection';

interface Reflection {
  date: string;
  accomplishment_1: string | null;
  accomplishment_2: string | null;
  accomplishment_3: string | null;
  priority_1: string | null;
  priority_2: string | null;
  priority_3: string | null;
}

type View = 'home' | 'reflection' | 'past';

const Refresh = () => {
  const [view, setView] = useState<View>('home');
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
  const navigate = useNavigate();

  const handleStartReflection = () => {
    setView('reflection');
  };

  const handleViewReflection = (reflection: Reflection) => {
    setSelectedReflection(reflection);
    setView('past');
  };

  const handleReflectionComplete = () => {
    navigate('/');
  };

  const handleBackToHome = () => {
    setSelectedReflection(null);
    setView('home');
  };

  if (view === 'reflection') {
    return <RefreshReflectionFlow onComplete={handleReflectionComplete} />;
  }

  if (view === 'past' && selectedReflection) {
    return <RefreshPastReflection reflection={selectedReflection} onBack={handleBackToHome} />;
  }

  return <RefreshHome onStartReflection={handleStartReflection} onViewReflection={handleViewReflection} />;
};

export default Refresh;
