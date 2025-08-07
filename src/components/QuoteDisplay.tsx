import React, { useState, useEffect } from 'react';

interface QuoteDisplayProps {
  quotes: string[];
  className?: string;
  interval?: number;
}

const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ 
  quotes, 
  className = "",
  interval = 3000 
}) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (quotes.length <= 1) return;

    const quoteInterval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
        setIsVisible(true);
      }, 300);
    }, interval);

    return () => clearInterval(quoteInterval);
  }, [quotes, interval]);

  if (!quotes.length) return null;

  return (
    <div className={`text-center transition-all duration-300 ${className}`}>
      <p 
        className={`text-xl text-muted-foreground italic transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        "{quotes[currentQuoteIndex]}"
      </p>
    </div>
  );
};

export default QuoteDisplay;