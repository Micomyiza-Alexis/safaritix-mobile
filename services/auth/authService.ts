import * as SecureStore from 'expo-secure-store';

import { api } from '@/services/api/client';

const ACCESS_TOKEN_KEY = 'safaritix_access_token';
const REFRESH_TOKEN_KEY = 'safaritix_refresh_token';

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

interface RefreshResponse {
  token: string;
  refreshToken: string;
}

export async function saveSession(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
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

  return api.get<AuthUser>('/auth/me', {
    token,
  });
}