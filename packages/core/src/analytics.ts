import { createHash } from 'node:crypto';
import { db, type Render } from '@easyrender/db';
import type { PostHog } from 'posthog-node';
import type { FunnelEvent } from './analytics-events';
import { type Attribution, pickAttribution, UTM_KEYS } from './attribution';

export type { FunnelEvent } from './analytics-events';

type Properties = Record<string, string | number | boolean | null>;
type EventContext = {
  userId: string | null;
  previewId: string | null;
  source: string;
  attribution: Attribution;
};
type Scheduler = (work: () => Promise<void>) => void;
let schedule: Scheduler = (work) => {
  void work();
};
export function setAnalyticsScheduler(scheduler: Scheduler) {
  schedule = scheduler;
}
export function deferAnalytics(work: () => Promise<void>) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    schedule(async () => {
      try {
        await work();
      } catch {
        /* Best-effort analytics only. */
      }
    });
  } catch {
    /* No platform request context. */
  }
}
export function eventUuid(identity: string) {
  const hex = createHash('sha256').update(`easyrender:${identity}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
export function eventProperties(eventId: string, context: EventContext): Properties {
  const a = context.attribution;
  return {
    event_id: eventId,
    user_id: context.userId,
    preview_id: context.previewId,
    source_channel: ['web', 'api', 'mcp'].includes(context.source) ? context.source : 'web',
    ...Object.fromEntries(UTM_KEYS.map((key) => [`ft_${key}`, a[key]])),
    ft_referrer: a.referrer,
    ft_landing_path: a.landing_path,
    geo_country: a.geo_country,
    consent_region: a.consent_region_at_create ?? 'strict',
  };
}
/** Everything, including DB lookups and network flush, runs after the response. Fail closed. */
export function captureServer(
  event: FunnelEvent | 'purchase_completed',
  identity: string,
  context: EventContext,
  properties: Properties,
  alias?: string,
) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  const work = async () => {
    let client: PostHog | undefined;
    try {
      const user = context.userId
        ? await db().user.findUnique({ where: { id: context.userId } })
        : null;
      const attribution = user?.first_seen_at ? pickAttribution(user) : context.attribution;
      const { PostHog } = await import('posthog-node');
      client = new PostHog(key, {
        host:
          process.env.POSTHOG_HOST ||
          process.env.NEXT_PUBLIC_POSTHOG_HOST ||
          'https://eu.i.posthog.com',
        flushAt: 1,
        flushInterval: 0,
        requestTimeout: 1500,
        fetchRetryCount: 0,
        disableGeoip: true,
      });
      const uuid = eventUuid(`${event}:${identity}`);
      const distinctId = context.userId ?? `pv_${context.previewId}`;
      if (alias) client.alias({ distinctId, alias, disableGeoip: true });
      client.capture({
        distinctId,
        event,
        uuid,
        disableGeoip: true,
        properties: { ...eventProperties(uuid, { ...context, attribution }), ...properties },
      });
      await client.shutdown(2000);
    } catch {
      /* Analytics must never affect a render, account or payment. */
    }
  };
  deferAnalytics(work);
}
export function captureRender(
  event: Exclude<FunnelEvent, 'signup' | 'purchase'>,
  render: Render,
  properties: Properties,
) {
  captureServer(
    event,
    render.id,
    {
      userId: render.userId,
      previewId: render.id,
      source: render.source,
      attribution: pickAttribution(render),
    },
    properties,
  );
}
