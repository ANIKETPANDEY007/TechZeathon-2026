import { useState, useEffect } from 'react';
import { checkMLStatus } from '../api/fallingdown';
import toast from 'react-hot-toast';

export const useMLStatus = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => {
    let previousStatus = null;

    const pollStatus = async () => {
      try {
        await checkMLStatus();
        setIsOnline(true);
        if (previousStatus === false) {
          toast.success('ML Backend Online');
        }
        previousStatus = true;
      } catch (error) {
        setIsOnline(false);
        if (previousStatus === true || previousStatus === null) {
          toast.error('ML Backend Offline - Check Connection');
        }
        previousStatus = false;
      } finally {
        setLastChecked(new Date());
      }
    };

    pollStatus();
    const intervalId = setInterval(pollStatus, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return { isOnline, lastChecked };
};
