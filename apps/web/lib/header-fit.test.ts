import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/config';
import de from '@/messages/de.json';
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import fr from '@/messages/fr.json';
import itMessages from '@/messages/it.json';
import pt from '@/messages/pt.json';

// The header (components/site-header.tsx) is one row at every width. Its fit was measured in
// Chromium at 320, 360, 390, 414, 768, 1024, 1280 and 1440px in all six languages (PR "fix:
// header overflow"). These budgets keep a later copy change from overflowing it again without a
// new browser check. Headroom when they were set: the phone CTA had 95px left at 320px (de,
// 15 characters), the full CTA 96px at 768px (fr), the desktop row 32px at 1280px (pt, 78).
// Raising a budget means re-measuring the header in a browser first.
const MAX_PHONE_CTA = 18; // Header.connect, the only label next to the menu button below 640px
const MAX_FULL_CTA = 22; // Header.connect + " " + Header.connectSuffix, from 640px
const MAX_DESKTOP_ROW = 80; // every Header.nav label + signIn + the full CTA, from 1280px

const MESSAGES = { en, es, de, fr, it: itMessages, pt };

describe('the header labels', () => {
  it.each(LOCALES)('%s fits the measured header widths', (locale) => {
    const header = MESSAGES[locale].Header;
    const fullCta = [header.connect, header.connectSuffix].filter(Boolean).join(' ');
    const row = Object.values(header.nav).join('') + header.signIn + fullCta;
    expect(header.connect.length, `${locale}: Header.connect`).toBeLessThanOrEqual(MAX_PHONE_CTA);
    expect(fullCta.length, `${locale}: connect + connectSuffix`).toBeLessThanOrEqual(MAX_FULL_CTA);
    expect(row.length, `${locale}: desktop row`).toBeLessThanOrEqual(MAX_DESKTOP_ROW);
  });
});
