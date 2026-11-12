import type { ConfigContext, ExpoConfig } from 'expo/config';

// app.json stays the source of truth. The EAS project (and Expo account) come from the environment
// when set, which is how CI builds without `eas init` having been committed.
export default ({ config }: ConfigContext): ExpoConfig => {
  const projectId = process.env.EAS_PROJECT_ID || config.extra?.eas?.projectId;
  return {
    ...(config as ExpoConfig),
    ...(process.env.EXPO_OWNER ? { owner: process.env.EXPO_OWNER } : {}),
    ...(projectId ? { extra: { ...config.extra, eas: { ...config.extra?.eas, projectId } } } : {}),
  };
};
