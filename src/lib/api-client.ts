// API Client utility for consistent API calls
export function getApiBaseUrl(): string {
  // For client-side
  if (typeof window !== 'undefined') {
    // Always use the current origin (this handles both dev and prod)
    // This ensures the API calls go to the same server that served the page
    return window.location.origin;
  }
  
  // For server-side, use environment variable or default
  // Updated default to use port 3002 which is the current running port
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
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