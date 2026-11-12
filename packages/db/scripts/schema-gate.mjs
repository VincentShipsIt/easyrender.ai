// Decides whether a pending schema change can lose data, from the SQL that
// `prisma migrate diff --script` prints. Prisma's own `db push` stops on any new unique
// constraint, even on an empty table, so a purely additive change (new tables, new columns,
// new indexes) used to block the production deploy until someone set DB_ACCEPT_DATA_LOSS=1.
// An additive change cannot lose data, so the deploy accepts it. Anything else (drops, type
// changes, renames, a required column without a default) still stops for a person to review.

/** @param {string} sql */
function statementsOf(sql) {
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);
}

/** Split on commas that are not inside parentheses, so `numeric(10, 2)` stays in one piece. */
function topLevelParts(text) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (char === ',' && depth === 0) {
      parts.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts.filter(Boolean);
}

/** @param {string} clause one clause of an ALTER TABLE statement */
function isAdditiveClause(clause) {
  if (/^ADD CONSTRAINT\b/i.test(clause)) return true;
  if (/^ADD COLUMN\b/i.test(clause)) {
    // A required column with no default fails on a table that already has rows.
    return !(/\bNOT NULL\b/i.test(clause) && !/\bDEFAULT\b/i.test(clause));
  }
  return false;
}

/** @param {string} statement */
export function isAdditiveStatement(statement) {
  if (/^CREATE TABLE\b/i.test(statement)) return true;
  if (/^CREATE TYPE\b/i.test(statement)) return true;
  if (/^CREATE (UNIQUE )?INDEX\b/i.test(statement)) return true;
  if (/^ALTER TYPE\b[\s\S]*\bADD VALUE\b/i.test(statement)) return true;
  const alter = statement.match(/^ALTER TABLE\s+"[^"]+"(?:\."[^"]+")?\s+([\s\S]+)$/i);
  if (alter) return topLevelParts(alter[1]).every(isAdditiveClause);
  return false;
}

/**
 * @param {string} sql the script `prisma migrate diff --script` printed
 * @returns {{ isEmpty: boolean, isAdditive: boolean, risky: string[] }} `risky` holds the
 * statements that are not provably additive, so a person can read what needs review.
 */
export function assessChange(sql) {
  const statements = statementsOf(sql);
  const risky = statements.filter((statement) => !isAdditiveStatement(statement));
  return { isEmpty: statements.length === 0, isAdditive: risky.length === 0, risky };
}
