import { createHash } from 'node:crypto';
import { db, Prisma } from '@easyrender/db';
import { PRICING_FLAG } from '@easyrender/harness';

export const PRICING_VISIT_LIMIT = 1000;
export const PRICING_VISITS_KEY = `${PRICING_FLAG}:visits`;

/** Bounded set doubles as the unique-visitor counter: there is no count/set drift. */
function subjects(value: string): string[] {
  const parsed: unknown = JSON.parse(value);
  if (
    !Array.isArray(parsed) ||
    parsed.length > PRICING_VISIT_LIMIT ||
    parsed.some((item) => typeof item !== 'string' || !/^[a-f0-9]{64}$/.test(item)) ||
    new Set(parsed).size !== parsed.length
  )
    throw new Error('Invalid pricing visit counter');
  return parsed;
}

/**
 * Enrol only on a pricing page. All other callers (checkout, signup, MCP and exposure checks)
 * read the same primary DB without a cache. Failure is handled by pricingDecision as control.
 * The 1,000th unique visit is recorded, but closes the experiment even for that visitor.
 */
export async function hasPricingVisit(identity: string, isPricingPage = false): Promise<boolean> {
  const subject = createHash('sha256').update(`${PRICING_FLAG}:${identity}`).digest('hex');
  if (!isPricingPage) {
    const row = await db().verification.findUnique({
      where: { id: PRICING_VISITS_KEY },
      select: { value: true },
    });
    const visits = row ? subjects(row.value) : [];
    return visits.length < PRICING_VISIT_LIMIT && visits.includes(subject);
  }
  return db().$transaction(
    async (tx) => {
      // Parameterized SQL, same transaction/connection. ON CONFLICT handles concurrent creation;
      // FOR UPDATE serializes read/deduplicate/append across processes, not just this instance.
      await tx.$executeRaw`
        INSERT INTO verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt")
        VALUES (${PRICING_VISITS_KEY}, ${PRICING_VISITS_KEY}, '[]', '9999-12-31', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `;
      const rows = await tx.$queryRaw<{ value: string }[]>`
        SELECT value FROM verification WHERE id = ${PRICING_VISITS_KEY} FOR UPDATE
      `;
      const visits = subjects(rows[0].value);
      if (visits.length >= PRICING_VISIT_LIMIT) return false;
      if (!visits.includes(subject)) {
        visits.push(subject);
        await tx.verification.update({
          where: { id: PRICING_VISITS_KEY },
          data: { value: JSON.stringify(visits) },
        });
      }
      return visits.length < PRICING_VISIT_LIMIT;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
  );
}
