import { useState, useEffect } from 'react';
import { fetchLogs } from '../api/fallingdown';
import toast from 'react-hot-toast';

const notifiedCriticalIds = new Set();
const ACTIVE_INCIDENT_WINDOW_MS = 2 * 60 * 1000;

const getIncidentId = (incident) => incident?.id || incident?._id || incident?.timestamp;

const parseIncidentTime = (timestamp) => {
  if (!timestamp) return null;
  const isoStr = timestamp.includes(' ') ? timestamp.replace(' ', 'T') : timestamp;
  const date = new Date(isoStr);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getLatestIncident = (logs) => {
  return [...logs].sort((a, b) => {
    const aTime = parseIncidentTime(a.timestamp)?.getTime() || 0;
    const bTime = parseIncidentTime(b.timestamp)?.getTime() || 0;
    return bTime - aTime;
  })[0];
};

export const useIncidents = () => {
  const [logs, setLogs] = useState([]);
  const [latestStatus, setLatestStatus] = useState('NORMAL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let hasCompletedInitialFetch = false;

    const pollLogs = async () => {
      try {
        const response = await fetchLogs();
        const data = response.data;
        
        // Ensure data is array
        const logArray = Array.isArray(data) ? data : (data.logs || []);
        
        setLogs(logArray);
        setError(null);

        if (logArray.length > 0) {
          const latest = getLatestIncident(logArray);
          const latestTime = parseIncidentTime(latest?.timestamp);
          const isActiveIncident = latestTime && (Date.now() - latestTime.getTime()) < ACTIVE_INCIDENT_WINDOW_MS;

          let computedStatus = 'NORMAL';
          if (isActiveIncident && latest.movement_status === 'fall_detected') computedStatus = 'CRITICAL';
          else if (isActiveIncident && latest.movement_status === 'moderate_fall') computedStatus = 'WARNING';
          else if (isActiveIncident && latest.movement_status === 'audio_only') computedStatus = 'AUDIO_DISTRESS';
          
          setLatestStatus(computedStatus);

          const latestId = getIncidentId(latest);
          const shouldNotifyCritical =
            hasCompletedInitialFetch &&
            computedStatus === 'CRITICAL' &&
            latestId &&
            !notifiedCriticalIds.has(latestId);

          if (shouldNotifyCritical) {
            toast.error('🚨 Critical Fall Detected!', {
              id: `critical-${latestId}`,
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
            notifiedCriticalIds.add(latestId);
          }
        } else {
          setLatestStatus('NORMAL');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        hasCompletedInitialFetch = true;
        setIsLoading(false);
      }
    };

    pollLogs(); // Initial fetch
    const intervalId = setInterval(pollLogs, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return { logs, setLogs, latestStatus, isLoading, error };
};
