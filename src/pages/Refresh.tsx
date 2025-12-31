import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Home, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CONSISTENCY_QUOTES, Quote } from '@/data/consistencyQuotes';

type Phase = 'quote' | 'main';

const STORAGE_KEY = 'refresh-quote-index';

const Refresh = () => {
  const [phase, setPhase] = useState<Phase>('quote');
  const [quoteVisible, setQuoteVisible] = useState(false);
  const [mainVisible, setMainVisible] = useState(false);

  // Get quote on mount and advance index
  const currentQuote = useMemo<Quote>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const index = stored ? parseInt(stored, 10) : 0;
    const quote = CONSISTENCY_QUOTES[index % CONSISTENCY_QUOTES.length];
    
    // Advance for next time
    const nextIndex = (index + 1) % CONSISTENCY_QUOTES.length;
    localStorage.setItem(STORAGE_KEY, nextIndex.toString());
    
    return quote;
  }, []);

  // Form state
  const [accomplishments, setAccomplishments] = useState(['', '', '']);
  const [priorities, setPriorities] = useState(['', '', '']);

  useEffect(() => {
    // Quote fades in
    const quoteFadeIn = setTimeout(() => setQuoteVisible(true), 100);
    
    // Quote fades out, main form fades in
    const quoteFadeOut = setTimeout(() => setQuoteVisible(false), 5100);
    const showMain = setTimeout(() => {
      setPhase('main');
      setMainVisible(true);
    }, 6100);

    return () => {
      clearTimeout(quoteFadeIn);
      clearTimeout(quoteFadeOut);
      clearTimeout(showMain);
    };
  }, []);

  const handleAccomplishmentChange = (index: number, value: string) => {
    const newAccomplishments = [...accomplishments];
    newAccomplishments[index] = value;
    setAccomplishments(newAccomplishments);
  };

  const handlePriorityChange = (index: number, value: string) => {
    const newPriorities = [...priorities];
    newPriorities[index] = value;
    setPriorities(newPriorities);
  };

  const handleSubmit = () => {
    console.log('Accomplishments:', accomplishments);
    console.log('Priorities:', priorities);
    // For now just log - persistence can be added later
  };

  // Quote phase
  if (phase === 'quote') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div 
          className={`max-w-2xl text-center transition-opacity duration-1000 ${
            quoteVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <blockquote className="text-2xl md:text-3xl font-light text-foreground leading-relaxed mb-6">
            "{currentQuote.text}"
          </blockquote>
          <p className="text-lg text-muted-foreground">
            — {currentQuote.author}
          </p>
        </div>
      </div>
    );
  }

  // Main form phase
  return (
    <div className="min-h-screen bg-background">
      <div 
        className={`transition-opacity duration-1000 ${
          mainVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Header */}
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="p-2 hover:bg-accent rounded-lg transition-colors">
              <Home className="h-5 w-5 text-foreground" />
            </Link>
            <h1 className="text-xl font-semibold text-foreground">Refresh</h1>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Accomplishments Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-light text-foreground mb-6">
              What did you accomplish today?
            </h2>
            <div className="space-y-4">
              {accomplishments.map((value, index) => (
                <div key={`accomplishment-${index}`} className="flex items-start gap-3">
                  <span className="text-muted-foreground font-mono text-sm mt-3">
                    {index + 1}.
                  </span>
                  <Textarea
                    value={value}
                    onChange={(e) => handleAccomplishmentChange(index, e.target.value)}
                    placeholder="Write your accomplishment..."
                    className="min-h-[80px] resize-none bg-card border-border"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Priorities Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-light text-foreground mb-6">
              What's most important tomorrow?
            </h2>
            <div className="space-y-4">
              {priorities.map((value, index) => (
                <div key={`priority-${index}`} className="flex items-start gap-3">
                  <span className="text-muted-foreground font-mono text-sm mt-3">
                    {index + 1}.
                  </span>
                  <Textarea
                    value={value}
                    onChange={(e) => handlePriorityChange(index, e.target.value)}
                    placeholder="Write your priority..."
                    className="min-h-[80px] resize-none bg-card border-border"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleSubmit}
              size="lg"
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Save Reflection
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Refresh;
