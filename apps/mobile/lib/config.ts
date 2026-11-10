// The easyrender deployment the app talks to. Point EXPO_PUBLIC_API_URL at a LAN address for local dev.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://easyrender.ai').replace(
  /\/$/,
  '',
);
