import { OAuth2Client } from 'google-auth-library';

export const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

export function getAuthUrl(state?: string) {
  // Verificar configuración
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    console.error('❌ Missing Google OAuth configuration:', {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasRedirectUri: !!process.env.GOOGLE_REDIRECT_URI,
      redirectUri: process.env.GOOGLE_REDIRECT_URI
    });
    throw new Error('Google OAuth not properly configured');
  }
  
  console.log('🔧 Google OAuth Config:', {
    clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  });
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state: state || ''
  });
  
  console.log('✅ Auth URL generated with scopes:', SCOPES.length);
  return authUrl;
}

export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export function setCredentials(tokens: any) {
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}