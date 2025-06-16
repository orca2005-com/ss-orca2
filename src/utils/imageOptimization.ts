import { isValidUrl } from './index';

const DEFAULT_FALLBACK_IMAGE = 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg';

export const getOptimizedPexelsUrl = (originalUrl: string, quality: 'low' | 'medium' | 'high' = 'medium'): string => {
  // Validate input
  if (!originalUrl || typeof originalUrl !== 'string') {
    console.warn('Invalid URL provided to getOptimizedPexelsUrl:', originalUrl);
    return DEFAULT_FALLBACK_IMAGE;
  }

  // Check if URL is valid before processing
  if (!isValidUrl(originalUrl)) {
    console.warn('Invalid URL format:', originalUrl);
    return DEFAULT_FALLBACK_IMAGE;
  }

  // If not a Pexels URL, return as-is if valid, otherwise fallback
  if (!originalUrl.includes('pexels.com')) {
    return originalUrl;
  }

  const qualityMap = {
    low: '?auto=compress&cs=tinysrgb&w=400&q=60',
    medium: '?auto=compress&cs=tinysrgb&w=800&q=75',
    high: '?auto=compress&cs=tinysrgb&w=1200&q=85'
  };
  
  try {
    // Split URL safely
    const baseUrl = originalUrl.split('?')[0];
    return baseUrl + qualityMap[quality];
  } catch (error) {
    console.error('Error processing Pexels URL:', error);
    return DEFAULT_FALLBACK_IMAGE;
  }
};

export const createPlaceholderUrl = (originalUrl: string): string => {
  // Validate input
  if (!originalUrl || typeof originalUrl !== 'string') {
    return DEFAULT_FALLBACK_IMAGE + '?auto=compress&cs=tinysrgb&w=50&q=20';
  }

  // Check if URL is valid
  if (!isValidUrl(originalUrl)) {
    return DEFAULT_FALLBACK_IMAGE + '?auto=compress&cs=tinysrgb&w=50&q=20';
  }

  // If not a Pexels URL, return as-is
  if (!originalUrl.includes('pexels.com')) {
    return originalUrl;
  }

  try {
    const baseUrl = originalUrl.split('?')[0];
    return baseUrl + '?auto=compress&cs=tinysrgb&w=50&q=20';
  } catch (error) {
    console.error('Error creating placeholder URL:', error);
    return DEFAULT_FALLBACK_IMAGE + '?auto=compress&cs=tinysrgb&w=50&q=20';
  }
};