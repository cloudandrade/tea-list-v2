'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

const NavigationLoadingContext = createContext(null);

function isNavigableLink(anchor) {
  if (!anchor?.href || anchor.target || anchor.hasAttribute('download')) {
    return false;
  }

  const url = new URL(anchor.href);
  const currentUrl = new URL(window.location.href);

  return url.origin === currentUrl.origin && url.href !== currentUrl.href;
}

export function NavigationLoadingProvider({ children }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const startNavigationLoading = useCallback(() => {
    setLoading(true);
  }, []);

  const stopNavigationLoading = useCallback(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      stopNavigationLoading();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pathname, stopNavigationLoading]);

  useEffect(() => {
    function handleDocumentClick(event) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }

      const anchor = event.target.closest('a');

      if (isNavigableLink(anchor)) {
        startNavigationLoading();
      }
    }

    function handlePopState() {
      startNavigationLoading();
    }

    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [startNavigationLoading]);

  const value = useMemo(
    () => ({ startNavigationLoading, stopNavigationLoading }),
    [startNavigationLoading, stopNavigationLoading],
  );

  return (
    <NavigationLoadingContext.Provider value={value}>
      {children}
      {loading ? (
        <div className="route-loading-overlay" role="status" aria-live="polite" aria-busy="true">
          <div className="route-loading-card">
            <span className="app-spinner" aria-hidden="true" />
          </div>
        </div>
      ) : null}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext);

  if (!context) {
    throw new Error('useNavigationLoading deve ser usado dentro de NavigationLoadingProvider.');
  }

  return context;
}
