import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';

// Off until EXPO_PUBLIC_SENTRY_DSN is set at build time (EAS env), so local runs send nothing.
// No session replay: the app shows the customer's product photos.
const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 0.1,
  integrations: [
    Sentry.expoRouterIntegration({ enableTimeToInitialDisplay: !isRunningInExpoGo() }),
  ],
  enableNativeFramesTracking: !isRunningInExpoGo(),
});
