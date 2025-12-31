import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RefreshHome from '@/components/RefreshHome';
import RefreshReflectionFlow from '@/components/RefreshReflectionFlow';

type View = 'home' | 'reflection';

const Refresh = () => {
  const [view, setView] = useState<View>('home');
  const navigate = useNavigate();

  const handleStartReflection = () => {
    setView('reflection');
  };

  const handleReflectionComplete = () => {
    navigate('/');
  };

  if (view === 'reflection') {
    return <RefreshReflectionFlow onComplete={handleReflectionComplete} />;
  }

  return <RefreshHome onStartReflection={handleStartReflection} />;
};

export default Refresh;
