export const getOptimizedPexelsUrl = (originalUrl: string, quality: 'low' | 'medium' | 'high' = 'medium'): string => {
  // Return a placeholder if no URL provided
  if (!originalUrl || typeof originalUrl !== 'string') {
    return 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400&q=60';
  }

  // If it's already a valid URL, return as is for non-Pexels URLs
  try {
    const url = new URL(originalUrl);
    if (!url.hostname.includes('pexels.com')) {
      return originalUrl;
    }
  } catch (error) {
    // If URL construction fails, return a default placeholder
    return 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400&q=60';
  }

  const qualityMap = {
    low: '?auto=compress&cs=tinysrgb&w=400&q=60',
    medium: '?auto=compress&cs=tinysrgb&w=800&q=75',
    high: '?auto=compress&cs=tinysrgb&w=1200&q=85'
  };
  
  return originalUrl.split('?')[0] + qualityMap[quality];
};

export const createPlaceholderUrl = (originalUrl: string): string => {
  // Return a low-quality placeholder
  if (!originalUrl || typeof originalUrl !== 'string') {
    return 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=50&q=20';
  }

  try {
    const url = new URL(originalUrl);
    if (!url.hostname.includes('pexels.com')) {
      return originalUrl;
    }
  } catch (error) {
    return 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=50&q=20';
  }
  
  return originalUrl.split('?')[0] + '?auto=compress&cs=tinysrgb&w=50&q=20';
};