import { useEffect, useRef } from 'react';

// Hook to optimize HMR and prevent unnecessary re-renders
export const useOptimizedHMR = () => {
  const mounted = useRef(false);
  
  useEffect(() => {
    mounted.current = true;
    
    // Development-only HMR optimization
    if (import.meta.hot) {
      import.meta.hot.accept();
      
      // Preserve component state during HMR
      import.meta.hot.dispose(() => {
        // Clean up any intervals, timeouts, or subscriptions
      });
    }
    
    return () => {
      mounted.current = false;
    };
  }, []);
  
  return { mounted: mounted.current };
};

// Performance monitoring hook for development
export const useRenderTracker = (componentName: string) => {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times`);
    }
  });
  
  return renderCount.current;
};