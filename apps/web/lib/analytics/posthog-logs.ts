import 'server-only';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';

const token = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!token && process.env.NODE_ENV !== 'production') {
  console.warn(
    'NEXT_PUBLIC_POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_KEY is configured',
  );
}

if (!host && process.env.NODE_ENV !== 'production') {
  console.warn(
    'NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured',
  );
}

const loggerProvider =
  token && host
    ? new LoggerProvider({
        resource: resourceFromAttributes({ 'service.name': 'easyrender-web' }),
        processors: [
          new BatchLogRecordProcessor({
            exporter: new OTLPLogExporter({
              url: new URL('/i/v1/logs', host).toString(),
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }),
          }),
        ],
      })
    : null;

// This logger is intentionally isolated from the application's existing loggers.
const posthogLogger = loggerProvider?.getLogger('easyrender.posthog');

export function logRenderDraftCreated(source: 'api' | 'web', hasPrompt: boolean) {
  posthogLogger?.emit({
    body: 'render_draft_created',
    severityNumber: SeverityNumber.INFO,
    attributes: { source, has_prompt: hasPrompt },
  });
}

export function logRenderBuildStarted() {
  posthogLogger?.emit({
    body: 'render_build_started',
    severityNumber: SeverityNumber.INFO,
    attributes: { route: '/api/renders/[id]/render' },
  });
}
