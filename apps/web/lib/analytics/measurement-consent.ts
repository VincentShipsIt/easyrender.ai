import { CONFIG_VERSION, isToolAllowed } from '@easyrender/core/attribution';
import { privacyRegion } from './privacy-region';
export function allowsServerMeasurement(headers: Headers) {
  let choice: boolean | null = null;
  try {
    const raw = headers.get('cookie')?.match(/(?:^|;\s*)er_consent=([^;]+)/)?.[1];
    const value = JSON.parse(decodeURIComponent(raw ?? 'null'));
    const age = Date.now() - Date.parse(value?.date);
    if (
      value?.version === CONFIG_VERSION &&
      typeof value.accepted === 'boolean' &&
      age >= 0 &&
      age < 366 * 86400000
    )
      choice = value.accepted;
  } catch {
    /* Unknown consent stays strict in unknown/strict regions. */
  }
  const region = privacyRegion(headers);
  return isToolAllowed('ga4', region.consent_region, choice, region.gpc);
}
