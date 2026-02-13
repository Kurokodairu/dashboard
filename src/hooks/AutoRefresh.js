import { useEffect, useCallback } from 'react';

const DEFAULT_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

export default function useAutoRefresh(refreshFunction, intervalMs = DEFAULT_REFRESH_INTERVAL) {
  const memoizedRefresh = useCallback(refreshFunction, [refreshFunction]);

  useEffect(() => {
    // Initial fetch
    memoizedRefresh();

    // Set up interval for periodic refresh
    const interval = setInterval(memoizedRefresh, intervalMs);
    
    // Listen for manual refresh events
    const handleRefresh = () => memoizedRefresh();
    window.addEventListener('dashboard-refresh', handleRefresh);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('dashboard-refresh', handleRefresh);
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