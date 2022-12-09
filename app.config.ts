import type { ExpoConfig } from '@expo/config';

const PROJECT_ID = '8de3cae4-062d-419d-812f-bd9ccf9c66f8';

const config: ExpoConfig = {
  name: 'expo-nkeys-demo',
  slug: 'expo-nkeys-demo',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: `https://u.expo.dev/${PROJECT_ID}`,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    bundleIdentifier: 'com.github.astrawan.expo-nkeys-demo',
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    package: 'com.github.astrawan.expo_nkeys_demo',
  },
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    eas: {
      projectId: PROJECT_ID,
    },
  },
};

export default config;
