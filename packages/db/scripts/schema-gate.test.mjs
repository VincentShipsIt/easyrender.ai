import { describe, expect, it } from 'vitest';
import { assessChange } from './schema-gate.mjs';

// The script `prisma migrate diff` printed when #69 added a unique column to Render, which is the
// change that stopped every production deploy for 13 hours.
const FINAL_SHEET_CHANGE = `
-- AlterTable
ALTER TABLE "Render" ADD COLUMN     "finalSheetPredictionId" TEXT,
ADD COLUMN     "isLinkShared" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quality" JSONB;

-- CreateTable
CREATE TABLE "ShopifyShop" (
    "shop" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopifyShop_pkey" PRIMARY KEY ("shop")
);

-- CreateIndex
CREATE UNIQUE INDEX "Render_finalSheetPredictionId_key" ON "Render"("finalSheetPredictionId");

-- AddForeignKey
ALTER TABLE "ShopifyShop" ADD CONSTRAINT "ShopifyShop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
`;

describe('assessChange', () => {
  it('accepts new tables, nullable and defaulted columns, indexes and foreign keys', () => {
    expect(assessChange(FINAL_SHEET_CHANGE)).toEqual({
      isEmpty: false,
      isAdditive: true,
      risky: [],
    });
  });

  it('treats an empty migration as nothing to do', () => {
    expect(assessChange('-- This is an empty migration.\n')).toEqual({
      isEmpty: true,
      isAdditive: true,
      risky: [],
    });
  });

  it('flags a dropped column', () => {
    const result = assessChange('-- AlterTable\nALTER TABLE "Render" DROP COLUMN "error";');
    expect(result.isAdditive).toBe(false);
    expect(result.risky).toEqual(['ALTER TABLE "Render" DROP COLUMN "error"']);
  });

  it('flags a dropped table, a type change and a rename', () => {
    for (const sql of [
      'DROP TABLE "ApiKey";',
      'ALTER TABLE "Render" ALTER COLUMN "credits" SET DATA TYPE BIGINT;',
      'ALTER TABLE "Render" RENAME COLUMN "error" TO "failure";',
    ]) {
      expect(assessChange(sql).isAdditive).toBe(false);
    }
  });

  it('flags a required column with no default, which fails on a table with rows', () => {
    const result = assessChange('ALTER TABLE "user" ADD COLUMN "plan" TEXT NOT NULL;');
    expect(result.isAdditive).toBe(false);
  });

  it('flags a risky clause hidden in the same ALTER TABLE as safe ones', () => {
    const sql = 'ALTER TABLE "Render" ADD COLUMN "note" TEXT,\nDROP COLUMN "error";';
    expect(assessChange(sql).isAdditive).toBe(false);
  });

  it('does not split a comma inside a column type', () => {
    expect(assessChange('ALTER TABLE "Render" ADD COLUMN "cost" DECIMAL(10,2);').isAdditive).toBe(
      true,
    );
  });
});
