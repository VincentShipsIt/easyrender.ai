import { db, Prisma } from '@easyrender/db';
import { AppError } from './errors';

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';

export async function getBalance(userId: string): Promise<number> {
  const user = await db().user.findUnique({ where: { id: userId }, select: { credits: true } });
  return user?.credits ?? 0;
}

// Spends once per idempotency key: a second call with the same key is a no-op.
export async function spendCredits(input: {
  userId: string;
  amount: number;
  key: string;
  reason: string;
  renderId?: string;
}): Promise<void> {
  try {
    await db().$transaction(async (tx) => {
      await tx.creditLedger.create({
        data: {
          userId: input.userId,
          delta: -input.amount,
          reason: input.reason,
          idempotencyKey: input.key,
          renderId: input.renderId,
        },
      });
      const { count } = await tx.user.updateMany({
        where: { id: input.userId, credits: { gte: input.amount } },
        data: { credits: { decrement: input.amount } },
      });
      if (count === 0) throw new AppError('Not enough credits', 402, 'insufficient_credits');
    });
  } catch (error) {
    if (isUniqueViolation(error)) return;
    throw error;
  }
}

// Grants once per idempotency key. Returns false when the key was already used.
export async function grantCredits(input: {
  userId: string;
  amount: number;
  key: string;
  reason: string;
  renderId?: string;
  purchaseId?: string;
}): Promise<boolean> {
  try {
    await db().$transaction([
      db().creditLedger.create({
        data: {
          userId: input.userId,
          delta: input.amount,
          reason: input.reason,
          idempotencyKey: input.key,
          renderId: input.renderId,
          purchaseId: input.purchaseId,
        },
      }),
      db().user.update({
        where: { id: input.userId },
        data: { credits: { increment: input.amount } },
      }),
    ]);
    return true;
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    throw error;
  }
}
