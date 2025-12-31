import { useState, useCallback } from 'react';
import { CONSISTENCY_QUOTES, Quote } from '@/data/consistencyQuotes';

const STORAGE_KEY = 'refresh-quote-index';

export const useRefreshQuoteRotation = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });

  const [nextQuote, setNextQuote] = useState<Quote>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const index = stored ? parseInt(stored, 10) : 0;
    return CONSISTENCY_QUOTES[index % CONSISTENCY_QUOTES.length];
  });

  const getQuoteAndAdvance = useCallback((): Quote => {
    const quote = nextQuote;
    
    const nextIndex = (currentIndex + 1) % CONSISTENCY_QUOTES.length;
    setCurrentIndex(nextIndex);
    localStorage.setItem(STORAGE_KEY, nextIndex.toString());
    setNextQuote(CONSISTENCY_QUOTES[nextIndex]);
    
    return quote;
  }, [currentIndex, nextQuote]);

  const peekNextQuote = useCallback((): Quote => {
    return nextQuote;
  }, [nextQuote]);

  return {
    getQuoteAndAdvance,
    peekNextQuote,
    currentIndex,
    totalQuotes: CONSISTENCY_QUOTES.length,
  };
};
