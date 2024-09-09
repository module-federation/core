import { useEffect, useRef } from 'react';

function useBridgeRouteChange(
  onRouteChange: ({ from, to }: { from: string; to: string }) => void,
) {
  const previousUrlRef = useRef(window.location.pathname);

  useEffect(() => {
    const handleRouteChange = () => {
      const currentUrl = window.location.pathname;
      const from = previousUrlRef.current;
      const to = currentUrl;

      if (from !== to) {
        onRouteChange({ from, to });
        previousUrlRef.current = currentUrl;
      }
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      handleRouteChange();
    };

    window.history.replaceState = function (...args) {
      console.log('<<<<< replaceState called >>>>>>>', args);
      originalReplaceState.apply(window.history, args);
      handleRouteChange(); // Manually trigger route change handler
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [onRouteChange]);
}

export { useBridgeRouteChange };
