export function gaMeasurementId(): string {
  // Public destination ID, not a credential. Explicit empty overrides disable collection.
  return (
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ??
    (process.env.VERCEL_ENV === 'production' ? 'G-H54Y1NW81X' : '')
  );
}
