// API Client utility for consistent API calls
export function getApiBaseUrl(): string {
  // For client-side
  if (typeof window !== 'undefined') {
    // In development, always use port 3001
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    // In production, use the current origin
    return window.location.origin;
  }
  
  // For server-side, use environment variable or default
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
}

export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}