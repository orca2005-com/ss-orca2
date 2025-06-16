import { useEffect, useRef } from 'react';
import { ddosProtection } from '../utils/ddosProtection';

export const useDDoSProtection = () => {
  const requestTimes = useRef<number[]>([]);
  const clientId = useRef<string>('');

  useEffect(() => {
    clientId.current = ddosProtection.getClientFingerprint();
  }, []);

  const checkRequest = (): boolean => {
    const now = Date.now();
    requestTimes.current.push(now);

    // Keep only last 100 requests
    if (requestTimes.current.length > 100) {
      requestTimes.current = requestTimes.current.slice(-100);
    }

    // Check for suspicious patterns
    const isSuspicious = ddosProtection.analyzeRequestPattern(
      requestTimes.current,
      60 * 1000 // 1 minute window
    );

    if (isSuspicious) {
      console.warn('Suspicious request pattern detected');
      return false;
    }

    return !ddosProtection.shouldBlockRequest(clientId.current, navigator.userAgent);
  };

  return { checkRequest, clientId: clientId.current };
};