import { useState, useEffect } from 'react';

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedVal, setDebouncedVal] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedVal(value), delay);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedVal;
};
