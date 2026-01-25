import { useState, useEffect, useRef } from 'react';

const useThrottle = <T,>(value: T, delay: number): T => {
  const [throttledVal, setThrottledVal] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledVal(value);
        lastRan.current = Date.now();
      }
    }, delay - (Date.now() - lastRan.current));

    return () => clearTimeout(handler);
  }, [value, delay]);

  return throttledVal;
};

export default useThrottle;
