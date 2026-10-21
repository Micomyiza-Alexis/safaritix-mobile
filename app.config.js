
const fs = require('fs');
const path = require('path');
const appJson = require('./app.json');

function readEnvValue(filePath, name) {
  if (!fs.existsSync(filePath)) return '';

  const line = fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .find((entry) => new RegExp(`^\\s*${name}\\s*=`).test(entry));

  if (!line) return '';
  return line.split('=', 2)[1].trim().replace(/^['"]|['"]$/g, '');
}

function resolveGoogleMapsApiKeys() {
  const androidFromProcess =
    process.env.GOOGLE_MAPS_ANDROID_API_KEY ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const iosFromProcess =
    process.env.GOOGLE_MAPS_IOS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const webEnvRoot = path.resolve(
    __dirname,
    '../project_safatiTix-developer'
  );

  const webFallback =
    readEnvValue(
      path.join(webEnvRoot, '.env.local'),
      'VITE_GOOGLE_MAPS_API_KEY'
    ) ||
    readEnvValue(
      path.join(webEnvRoot, '.env.production'),
      'VITE_GOOGLE_MAPS_API_KEY'
    );

  return {
    android:
      androidFromProcess ||
      readEnvValue(
        path.join(webEnvRoot, '.env.local'),
        'GOOGLE_MAPS_ANDROID_API_KEY'
      ) ||
      readEnvValue(
        path.join(webEnvRoot, '.env.production'),
        'GOOGLE_MAPS_ANDROID_API_KEY'
      ) ||
      webFallback,
    ios: iosFromProcess || webFallback,
  };
}

module.exports = ({ config }) => {
  const googleMapsApiKeys = resolveGoogleMapsApiKeys();

  const existingPlugins =
    config.plugins || appJson.expo.plugins || [];

  const plugins = [...existingPlugins];

  if (
    !plugins.some((plugin) =>
      Array.isArray(plugin)
        ? plugin[0] === '@maplibre/maplibre-react-native'
        : plugin === '@maplibre/maplibre-react-native'
    )
  ) {
    plugins.push('@maplibre/maplibre-react-native');
  }

  if (
    (googleMapsApiKeys.android || googleMapsApiKeys.ios) &&
    !plugins.some((plugin) =>
      Array.isArray(plugin) && plugin[0] === 'react-native-maps'
    )
  ) {
    plugins.push([
      'react-native-maps',
      {
        androidGoogleMapsApiKey: googleMapsApiKeys.android,
        iosGoogleMapsApiKey: googleMapsApiKeys.ios,
      },
    ]);
  }

  return {
    ...appJson.expo,
    ...config,
    plugins,
  };
};
