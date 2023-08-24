import { useState, useEffect } from 'react';

export function useIsApp() {
  const [loading, setLoading] = useState(true);
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor;

    if (/gonative/i.test(userAgent)) {
      setIsApp(true);
    }

    setLoading(false);
  }, []);

  return { isApp, loading };
}