import { useEffect, useCallback } from 'react';

export default function useAutoRefresh(refreshFunction, intervalMs = 15 * 60 * 1000) { // 15 * 60 * 1000  = 15 min
  // useCallback ensures the refresh function reference is stable
  const memoizedRefresh = useCallback(refreshFunction, [refreshFunction]);

  useEffect(() => {
    memoizedRefresh();

    const handleRefresh = () => {
      memoizedRefresh();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        memoizedRefresh();
      }
    };

    // Set up the interval and event listeners
    const interval = setInterval(handleRefresh, intervalMs);
    window.addEventListener('dashboard-refresh', handleRefresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function to remove listeners and interval when the component unmounts
    return () => {
      clearInterval(interval);
      window.removeEventListener('dashboard-refresh', handleRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [memoizedRefresh, intervalMs]);
}

// this hook can be used in any component like this:
// import useAutoRefresh from '../hooks/AutoRefresh.js'
//
// replaces the useEffect
// const MyComponent = () => {
//   const fetchData = () => {
//     // Your data fetching logic here
//   };
//   useAutoRefresh(fetchData, 10 * 60 * 1000); // Refresh every 10 minutes
//   return (
//     <div>
//       {/* Your component content */}
//     </div>
//   );
// };
//