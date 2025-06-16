export const getOptimizedPexelsUrl = (originalUrl: string, quality: 'low' | 'medium' | 'high' = 'medium'): string => {
  if (!originalUrl || typeof originalUrl !== 'string') {
    return 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'; // Default fallback image
  }

  // Check if URL is valid
  try {
    new URL(originalUrl);
  } catch (e) {
    console.error('Invalid URL:', originalUrl);
    return 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'; // Default fallback image
  }

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
  if (!originalUrl || typeof originalUrl !== 'string') {
    return 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=50&q=20';
  }

  // Check if URL is valid
  try {
    new URL(originalUrl);
  } catch (e) {
    console.error('Invalid URL for placeholder:', originalUrl);
    return 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=50&q=20';
  }

  if (!originalUrl.includes('pexels.com')) {
    return originalUrl;
  }
  return originalUrl.split('?')[0] + '?auto=compress&cs=tinysrgb&w=50&q=20';
};