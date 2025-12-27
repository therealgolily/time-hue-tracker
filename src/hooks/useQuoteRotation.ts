import { useState, useEffect, useCallback } from 'react';
import { MOTIVATIONAL_QUOTES, Quote } from '@/data/motivationalQuotes';

const STORAGE_KEY = 'livemode-quote-index';

export const useQuoteRotation = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });

  const [nextQuote, setNextQuote] = useState<Quote>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const index = stored ? parseInt(stored, 10) : 0;
    return MOTIVATIONAL_QUOTES[index % MOTIVATIONAL_QUOTES.length];
  });

  // Get the current quote and advance to next
  const getQuoteAndAdvance = useCallback((): Quote => {
    const quote = nextQuote;
    
    // Advance to next quote
    const nextIndex = (currentIndex + 1) % MOTIVATIONAL_QUOTES.length;
    setCurrentIndex(nextIndex);
    localStorage.setItem(STORAGE_KEY, nextIndex.toString());
    setNextQuote(MOTIVATIONAL_QUOTES[nextIndex]);
    
    return quote;
  }, [currentIndex, nextQuote]);

  // Peek at the next quote without advancing
  const peekNextQuote = useCallback((): Quote => {
    return nextQuote;
  }, [nextQuote]);

  return {
    getQuoteAndAdvance,
    peekNextQuote,
    currentIndex,
    totalQuotes: MOTIVATIONAL_QUOTES.length,
  };
};
