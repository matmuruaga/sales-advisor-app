// src/lib/mockAuth.ts

export interface MockUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'rep' | 'bdr';
  organization_id: string;
}

export const MOCK_USER: MockUser = {
  id: 'mock-user-123',
  email: 'manager@company.com',
  full_name: 'Demo Manager',
  role: 'manager',
  organization_id: 'mock-org-123'
};

// Function to simulate authentication for development
export const createMockSession = () => {
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: MOCK_USER.id,
      email: MOCK_USER.email,
      user_metadata: {
        full_name: MOCK_USER.full_name,
        role: MOCK_USER.role,
        organization_id: MOCK_USER.organization_id
      },
      app_metadata: {
        provider: 'email',
        providers: ['email']
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
      phone: '',
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      role: 'authenticated',
      updated_at: new Date().toISOString()
    }
  };
};

// Environment check for using mock data
export const shouldUseMockData = (): boolean => {
  return process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
};