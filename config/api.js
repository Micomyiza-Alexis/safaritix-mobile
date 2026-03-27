import Constants from 'expo-constants';
import { Platform } from 'react-native';

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const normalizeApiUrl = (value) => {
  const normalized = trimTrailingSlash(value);
  if (!normalized) return '';
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

const extractHost = (value) => {
  if (!value) return '';

  const raw = String(value).trim();
  if (!raw) return '';

  const withoutProtocol = raw.replace(/^[a-z]+:\/\//i, '');
  const withoutPath = withoutProtocol.split('/')[0];
  const host = withoutPath.split(':')[0];
  return host || '';
};

const resolveExpoHost = () => {
  const hostCandidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.manifest2?.extra?.expoClient?.hostUri,
    Constants.linkingUri,
  ];

  for (const candidate of hostCandidates) {
    const host = extractHost(candidate);
    if (host) return host;
  }

  return '';
};

const resolveLocalApiUrl = () => {
  const explicitUrl = normalizeApiUrl(process.env.EXPO_PUBLIC_API_URL);
  if (explicitUrl) return explicitUrl;

  const expoHost = resolveExpoHost();
  if (expoHost) {
    return `http://${expoHost}:5000/api`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://localhost:5000/api';
};

export const API_BASE_URL = resolveLocalApiUrl();
