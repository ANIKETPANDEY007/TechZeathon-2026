import { useState, useEffect } from 'react';
import { fetchLogs } from '../api/fallingdown';
import toast from 'react-hot-toast';

export const useIncidents = () => {
  const [logs, setLogs] = useState([]);
  const [latestStatus, setLatestStatus] = useState('NORMAL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let lastCriticalId = null;

    const pollLogs = async () => {
      try {
        const response = await fetchLogs();
        const data = response.data;
        
        // Ensure data is array
        const logArray = Array.isArray(data) ? data : (data.logs || []);
        
        setLogs(logArray);
        setError(null);

        if (logArray.length > 0) {
          const lastLog = logArray[logArray.length - 1]; // Assuming appended to end, or [0] if reversed
          // Adjust based on typical ML backend format, assuming latest is first or last.
          const latest = logArray[0]?.timestamp > logArray[logArray.length - 1]?.timestamp ? logArray[0] : logArray[logArray.length - 1];

          let computedStatus = 'NORMAL';
          if (latest.movement_status === 'fall_detected') computedStatus = 'CRITICAL';
          else if (latest.movement_status === 'moderate_fall') computedStatus = 'WARNING';
          else if (latest.movement_status === 'audio_only') computedStatus = 'AUDIO_DISTRESS';
          
          setLatestStatus(computedStatus);

          // Toast for new critical incident
          if (computedStatus === 'CRITICAL' && latest.id !== lastCriticalId) {
            toast.error('🚨 Critical Fall Detected!', {
              style: {
                border: '1px solid #ef4444',
                padding: '16px',
                color: '#ef4444',
                background: '#0f172a',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#FFFAEE',
              },
            });
            lastCriticalId = latest.id;
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    pollLogs(); // Initial fetch
    const intervalId = setInterval(pollLogs, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return { logs, setLogs, latestStatus, isLoading, error };
};
