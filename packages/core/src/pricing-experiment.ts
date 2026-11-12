import { createHash } from 'node:crypto';
import { db } from '@easyrender/db';
import { PRICING_FLAG, type PricingVariant } from '@easyrender/harness';
import { hasPricingVisit } from './pricing-visits';

// Deliberately supports only a single, property-free rollout. Unsupported targeting fails closed.
export type PricingFlag = {
  key: string;
  active: boolean;
  deleted?: boolean;
  filters: {
    aggregation_group_type_index?: number | null;
    groups: { properties: unknown[]; rollout_percentage: number; variant?: string | null }[];
    multivariate: { variants: { key: string; rollout_percentage: number }[] };
  };
};
const hash = (identity: string, salt = '') =>
  Number.parseInt(
    createHash('sha1').update(`${PRICING_FLAG}.${identity}${salt}`).digest('hex').slice(0, 15),
    16,
  ) / Number('0xfffffffffffffff');

function isValidPricingFlag(flag: PricingFlag | null): flag is PricingFlag {
  if (!flag || flag.key !== PRICING_FLAG || !flag.active || flag.deleted) return false;
  const filters = flag.filters;
  if (!filters || filters.aggregation_group_type_index != null || filters.groups?.length !== 1)
    return false;
  const group = filters.groups[0];
  const variants = filters.multivariate?.variants;
  if (
    !group ||
    !Array.isArray(group.properties) ||
    group.properties.length ||
    group.variant ||
    !Number.isFinite(group.rollout_percentage) ||
    group.rollout_percentage <= 0 ||
    group.rollout_percentage > 100 ||
    !Array.isArray(variants) ||
    variants.length !== 2 ||
    new Set(variants.map((v) => v.key)).size !== 2 ||
    variants.some(
      (v) =>
        !['control', 'test'].includes(v.key) ||
        !Number.isFinite(v.rollout_percentage) ||
        v.rollout_percentage < 0 ||
        v.rollout_percentage > 100,
    ) ||
    variants.reduce((total, v) => total + v.rollout_percentage, 0) !== 100
  )
    return false;
  return true;
}

/** Matches PostHog's property-free percentage and multivariate hash; never sends an identity. */
export function evaluatePricingFlag(
  flag: PricingFlag | null,
  identity: string | null,
): PricingVariant {
  if (!isValidPricingFlag(flag) || !identity) return 'control';
  const group = flag.filters.groups[0];
  const variants = flag.filters.multivariate.variants;
  if (hash(identity) >= group.rollout_percentage / 100) return 'control';
  const bucket = hash(identity, 'variant');
  let end = 0;
  for (const variant of variants) {
    end += variant.rollout_percentage / 100;
    if (bucket < end) return variant.key === 'test' ? 'test' : 'control';
  }
  return 'control';
}

let cached: { until: number; flag: PricingFlag | null } | undefined;
let pending: Promise<PricingFlag | null> | undefined;
export function isPricingExperimentConfigured() {
  return (
    process.env.PRICING_AB_ENABLED === '1' &&
    Boolean(
      process.env.NEXT_PUBLIC_POSTHOG_KEY &&
        process.env.POSTHOG_PERSONAL_API_KEY &&
        process.env.POSTHOG_PROJECT_ID,
    )
  );
}
async function pricingFlag(): Promise<PricingFlag | null> {
  if (!isPricingExperimentConfigured()) return null;
  if (cached && cached.until > Date.now()) return cached.flag;
  if (pending) return pending;
  pending = (async () => {
    let flag: PricingFlag | null = null;
    try {
      const host = process.env.POSTHOG_API_HOST || 'https://eu.posthog.com';
      const url = new URL(
        `/api/projects/${encodeURIComponent(process.env.POSTHOG_PROJECT_ID ?? '')}/feature_flags/`,
        host,
      );
      url.searchParams.set('key', PRICING_FLAG);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(1500),
      });
      if (response.ok) {
        const body = (await response.json()) as { results?: PricingFlag[] };
        flag = body.results?.find((item) => item.key === PRICING_FLAG) ?? null;
      }
    } catch {
      /* Missing, malformed or unavailable flags always mean control. Never reuse stale flags. */
    }
    cached = { until: Date.now() + 30_000, flag };
    return flag;
  })();
  try {
    return await pending;
  } finally {
    pending = undefined;
  }
}

/**
 * A namespaced key/value in the existing Verification store preserves the visitor seed for an
 * account. The primary key makes simultaneous first requests atomic. This is not an auth token;
 * no auth-state/reset identifier can collide. A one-year TTL covers this finite experiment.
 */
export async function pricingIdentity(
  userId: string | null,
  anonId: string | null,
): Promise<string | null> {
  if (!userId) return anonId;
  const key = `${PRICING_FLAG}:identity:${userId}`;
  const stored = await db().verification.upsert({
    where: { id: key },
    update: { id: key },
    create: {
      id: key,
      identifier: key,
      value: anonId || userId,
      expiresAt: new Date(Date.now() + 365 * 86400_000),
    },
    select: { value: true },
  });
  return stored.value;
}

export type PricingDecision = { variant: PricingVariant; isExperimentActive: boolean };
const control: PricingDecision = { variant: 'control', isExperimentActive: false };

export async function pricingDecision(
  userId: string | null,
  anonId: string | null = null,
  isPricingPage = false,
): Promise<PricingDecision> {
  if (!isPricingExperimentConfigured()) return control;
  const flag = await pricingFlag();
  if (!isValidPricingFlag(flag)) return control;
  try {
    const identity = await pricingIdentity(userId, anonId);
    if (!identity || !(await hasPricingVisit(identity, isPricingPage))) return control;
    return { variant: evaluatePricingFlag(flag, identity), isExperimentActive: true };
  } catch {
    // Missing/unreadable/corrupt counter, write or transaction failure: never reuse a test arm.
    return control;
  }
}

export async function assignedPricing(
  userId: string | null,
  anonId: string | null = null,
): Promise<PricingVariant> {
  return (await pricingDecision(userId, anonId)).variant;
}

// Legacy purchases retain their original pack id. New test purchases snapshot the variant without a migration.
export const purchasePackId = (plan: string, variant: PricingVariant) =>
  variant === 'test' ? `${plan}:test` : plan;
export const purchasedVariant = (packId: string): PricingVariant =>
  packId.endsWith(':test') ? 'test' : 'control';

/** A join key for consented experiment analysis, never an SDK identify call or a new cookie. */
export async function pricingSubject(
  userId: string | null,
  anonId: string | null = null,
): Promise<string | null> {
  let identity = anonId;
  try {
    if (userId) {
      const record = await db().verification.findUnique({
        where: { id: `${PRICING_FLAG}:identity:${userId}` },
        select: { value: true },
      });
      identity = record?.value ?? userId;
    }
  } catch {
    return null;
  }
  return identity ? createHash('sha256').update(`${PRICING_FLAG}:${identity}`).digest('hex') : null;
}
