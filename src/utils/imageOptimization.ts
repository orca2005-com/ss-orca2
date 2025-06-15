export const getOptimizedPexelsUrl = (originalUrl: string, quality: 'low' | 'medium' | 'high' = 'medium'): string => {
  if (!originalUrl.includes('pexels.com')) {
    return originalUrl;
  }

  const qualityMap = {
    low: '?auto=compress&cs=tinysrgb&w=400&q=60',
    medium: '?auto=compress&cs=tinysrgb&w=800&q=75',
    high: '?auto=compress&cs=tinysrgb&w=1200&q=85'
  };
  
  return originalUrl.split('?')[0] + qualityMap[quality];
};

export const createPlaceholderUrl = (originalUrl: string): string => {
  if (!originalUrl.includes('pexels.com')) {
    return originalUrl;
  }
  return originalUrl.split('?')[0] + '?auto=compress&cs=tinysrgb&w=50&q=20';
};