import * as SecureStore from 'expo-secure-store';

import { api } from '@/services/api/client';

const ACCESS_TOKEN_KEY = 'safaritix_access_token';
const REFRESH_TOKEN_KEY = 'safaritix_refresh_token';
let sessionInvalidatedInMemory = false;

export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  avatar_url?: string | null;
  companyId?: number | string | null;
  emailVerified?: boolean;
  companyVerified?: boolean;
  accountStatus?: string;
  subscriptionPlan?: string | null;
  planPermissions?: unknown;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
  homePath?: string;
  must_change_password?: boolean;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

interface RefreshResponse {
  token: string;
  refreshToken: string;
}

export async function saveSession(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  sessionInvalidatedInMemory = false;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  if (sessionInvalidatedInMemory) return null;
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  return token || null;
}

export async function getRefreshToken(): Promise<string | null> {
  if (sessionInvalidatedInMemory) return null;
  const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  return token || null;
}

export async function clearSession(): Promise<void> {
  sessionInvalidatedInMemory = true;
  // Keep logout/session invalidation non-fatal on a stale Expo client. The
  // native SecureStore deletion succeeds after the client is rebuilt to match
  // the installed expo-secure-store version.
  await Promise.allSettled([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', {
    email: email.trim().toLowerCase(),
    password,
  });

  await saveSession(response.token, response.refreshToken);

  return response;
}

export async function register(
  fullName: string,
  email: string,
  password: string,
  phoneNumber?: string,
): Promise<RegisterResponse> {
  return api.post<RegisterResponse>('/auth/register', {
    full_name: fullName.trim(),
    email: email.trim().toLowerCase(),
    password,
    phone_number: phoneNumber?.trim() || undefined,
    role: 'commuter',
  });
}

export async function refreshSession(): Promise<RefreshResponse> {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available.');
  }

  const response = await api.post<RefreshResponse>('/auth/refresh-token', {
    refreshToken,
  });

  await saveSession(response.token, response.refreshToken);

  return response;
}

export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();

  try {
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
  } finally {
    await clearSession();
  }
}

export async function getCurrentUser(): Promise<AuthUser> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error('No access token available.');
  }

  const response = await api.get<{ user: AuthUser }>('/auth/me', {
    token,
  });

  return response.user;
}
