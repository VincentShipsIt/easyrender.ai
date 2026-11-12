/** Events emitted by authoritative core transitions and queried by admin analytics. */
export const FUNNEL_EVENTS = [
  'preview_start',
  'preview_ready',
  'preview_failed',
  'signup',
  'render_start',
  'render_ready',
  'render_failed',
  'purchase',
] as const;
export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];
