import { useEffect, useRef } from 'react';

export const useFirstMounted = (): boolean => {
  const ref = useRef(true);

  useEffect(() => {
    ref.current = false;
  }, []);

  return ref.current;
};
