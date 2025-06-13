// Enhanced DDoS Protection Utilities
import { createRateLimiter } from './index';

interface DDoSConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxConcurrentConnections: number;
  suspiciousPatterns: RegExp[];
}

const ddosConfig: DDoSConfig = {
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
  maxConcurrentConnections: 10,
  suspiciousPatterns: [
    /bot|crawler|spider/i,
    /curl|wget|python|java/i,
    /attack|flood|ddos/i
  ]
};

// Multi-tier rate limiting
const minuteRateLimiter = createRateLimiter(ddosConfig.maxRequestsPerMinute, 60 * 1000);
const hourRateLimiter = createRateLimiter(ddosConfig.maxRequestsPerHour, 60 * 60 * 1000);

// Connection tracking
const activeConnections = new Map<string, number>();

export const ddosProtection = {
  // Check if request should be blocked
  shouldBlockRequest: (clientId: string, userAgent?: string): boolean => {
    // Rate limiting check
    if (!minuteRateLimiter(clientId) || !hourRateLimiter(clientId)) {
      console.warn(`Rate limit exceeded for client: ${clientId}`);
      return true;
    }

    // User agent analysis
    if (userAgent) {
      const isSuspicious = ddosConfig.suspiciousPatterns.some(pattern => 
        pattern.test(userAgent)
      );
      if (isSuspicious) {
        console.warn(`Suspicious user agent detected: ${userAgent}`);
        return true;
      }
    }

    // Connection limit check
    const currentConnections = activeConnections.get(clientId) || 0;
    if (currentConnections >= ddosConfig.maxConcurrentConnections) {
      console.warn(`Too many concurrent connections for client: ${clientId}`);
      return true;
    }

    return false;
  },

  // Track connection
  trackConnection: (clientId: string): void => {
    const current = activeConnections.get(clientId) || 0;
    activeConnections.set(clientId, current + 1);
  },

  // Release connection
  releaseConnection: (clientId: string): void => {
    const current = activeConnections.get(clientId) || 0;
    if (current <= 1) {
      activeConnections.delete(clientId);
    } else {
      activeConnections.set(clientId, current - 1);
    }
  },

  // Get client fingerprint
  getClientFingerprint: (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('DDoS Protection', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  },

  // Analyze request patterns
  analyzeRequestPattern: (requests: number[], timeWindow: number): boolean => {
    if (requests.length < 10) return false;
    
    const now = Date.now();
    const recentRequests = requests.filter(time => now - time < timeWindow);
    
    // Check for suspicious patterns
    const avgInterval = timeWindow / recentRequests.length;
    const isRapidFire = avgInterval < 100; // Less than 100ms between requests
    const isBurst = recentRequests.length > 50; // More than 50 requests in window
    
    return isRapidFire || isBurst;
  }
};

// Request interceptor for DDoS protection
export const createDDoSInterceptor = () => {
  const clientId = ddosProtection.getClientFingerprint();
  
  return {
    request: (config: any) => {
      // Track connection
      ddosProtection.trackConnection(clientId);
      
      // Check if request should be blocked
      if (ddosProtection.shouldBlockRequest(clientId, navigator.userAgent)) {
        ddosProtection.releaseConnection(clientId);
        throw new Error('Request blocked due to suspicious activity');
      }
      
      return config;
    },
    
    response: (response: any) => {
      ddosProtection.releaseConnection(clientId);
      return response;
    },
    
    error: (error: any) => {
      ddosProtection.releaseConnection(clientId);
      throw error;
    }
  };
};